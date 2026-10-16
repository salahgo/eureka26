import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Camera,
  ClipboardPaste,
  Database,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Hand,
  Info,
  ListChecks,
  Lock,
  MonitorPlay,
  QrCode as QrIcon,
  RefreshCw,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { DEFAULT_SEQUENCE, FULL_SEQUENCE, LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { activeSequence, defaultConfig, defaultPresentation } from '../../lib/config';
import { parseBatchHeader, extractCodes } from '../../lib/codec';
import { aggregatedCSV, aggregatedJSON, submissionsCSV } from '../../lib/exporters';
import { formatTime, fr } from '../../lib/format';
import {
  codesFromJSON,
  emptySession,
  ingestText,
  mergeSessions,
  parseSessionJSON,
  removeSubmission,
  setManualCounts,
  type IngestResult,
  type SessionData,
  type Via,
} from '../../lib/session';
import { scoreOf } from '../../lib/aggregate';
import { downloadFile, KEYS, readJSON, removeKey, timestampForFile, writeJSON } from '../../lib/storage';
import { syncAvailable } from '../../lib/sync';
import { invitationUrl, isLocalhost, PUBLIC_URL, route } from '../../lib/urls';
import Brand from '../common/Brand';
import { CategoryChip } from '../common/categories';
import { useConfig, usePresentation, useSession } from '../common/shared';
import Scanner, { type ScanFeedback } from './Scanner';
import RemotePanel from './RemotePanel';
import BatchTransfer from './BatchTransfer';

type Apply = <T extends { session: SessionData }>(fn: (prev: SessionData) => T) => T;

type Tab = 'collect' | 'submissions' | 'manual' | 'questions' | 'remote' | 'backup';

const TABS: { id: Tab; label: string; icon: typeof Camera }[] = [
  { id: 'collect', label: 'Collecte', icon: Camera },
  { id: 'submissions', label: 'Réponses reçues', icon: Users },
  { id: 'manual', label: 'Votes manuels', icon: Hand },
  { id: 'questions', label: 'Questions', icon: ListChecks },
  { id: 'remote', label: 'Télécommande', icon: MonitorPlay },
  { id: 'backup', label: 'Export & sauvegarde', icon: Database },
];

function summarize(results: IngestResult[]): { accepted: number; duplicate: number; conflict: number; invalid: number } {
  return {
    accepted: results.filter((r) => r.status === 'accepted').length,
    duplicate: results.filter((r) => r.status === 'duplicate').length,
    conflict: results.filter((r) => r.status === 'conflict').length,
    invalid: results.filter((r) => r.status === 'invalid').length,
  };
}

function summaryText(results: IngestResult[]): string {
  const s = summarize(results);
  const parts = [`${s.accepted} acceptée(s)`];
  if (s.duplicate) parts.push(`${s.duplicate} doublon(s)`);
  if (s.conflict) parts.push(`${s.conflict} conflit(s)`);
  if (s.invalid) parts.push(`${s.invalid} invalide(s)`);
  return parts.join(' · ');
}

async function sha256(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`eureka26:${text}`));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0;
    for (const c of text) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
    return `weak-${h}`;
  }
}

export default function AdminApp() {
  const [pinHash] = useState<string | null>(() => readJSON<string | null>(KEYS.pin, null));
  const [unlocked, setUnlocked] = useState(() => {
    if (!readJSON<string | null>(KEYS.pin, null)) return true;
    try {
      return sessionStorage.getItem('eureka26:unlocked') === '1';
    } catch {
      return false;
    }
  });
  if (!unlocked && pinHash) return <PinGate hash={pinHash} onUnlock={() => setUnlocked(true)} />;
  return <AdminMain />;
}

function PinGate({ hash, onUnlock }: { hash: string; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <Brand size="md" />
      <form
        className="glass mt-6 rounded-3xl p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if ((await sha256(pin)) === hash) {
            try {
              sessionStorage.setItem('eureka26:unlocked', '1');
            } catch {
              /* private mode: unlock for this page view only */
            }
            onUnlock();
          } else setErr(true);
        }}
      >
        <h1 className="flex items-center gap-2 font-display text-xl font-bold">
          <Lock size={20} /> Code PIN
        </h1>
        <input className="field mt-4" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="Code PIN" autoFocus />
        {err && <p className="mt-2 text-sm text-rose-300">Incorrect.</p>}
        <button className="btn btn-primary mt-4 w-full" type="submit">
          Déverrouiller
        </button>
      </form>
    </main>
  );
}

function AdminMain() {
  const [session, setSession] = useSession();
  const [config, setConfig] = useConfig();
  const [presentation, setPresentation] = usePresentation();
  const [tab, setTab] = useState<Tab>(() => {
    const h = window.location.hash.replace('#', '') as Tab;
    return TABS.some((t) => t.id === h) ? h : 'collect';
  });
  useEffect(() => {
    history.replaceState(null, '', `#${tab}`);
  }, [tab]);
  const sequence = useMemo(() => activeSequence(config), [config]);
  const complete = session.submissions.filter((s) => s.complete).length;
  const manualTotal = Object.values(session.manual).reduce((a, c) => a + c.reduce((x, y) => x + y, 0), 0);

  // Synchronous view of the latest session so that rapid scans never work on a stale copy.
  const sessionRef = useRef(session);
  const seenRef = useRef(session);
  if (seenRef.current !== session) {
    seenRef.current = session;
    sessionRef.current = session;
  }
  const apply: Apply = (fn) => {
    const out = fn(sessionRef.current);
    sessionRef.current = out.session;
    setSession(out.session);
    return out;
  };

  /** Ingests any text (QR content, paste, file) and returns the per-code results. */
  const ingest = (text: string, via: Via) => apply((prev) => ingestText(prev, text, via));

  const onScan = (text: string, via: 'camera' | 'image'): ScanFeedback => {
    const batch = parseBatchHeader(text);
    const codes = extractCodes(text);
    if (!codes.length) return { status: 'invalid', title: 'QR code non reconnu', detail: 'Ce n’est pas un code de réponse EUREKA26.' };
    const { results, session: next } = ingest(text, batch ? 'batch' : via);
    const total = next.submissions.length;
    if (batch || results.length > 1) {
      return { status: 'batch', title: batch ? `Lot ${batch.page}/${batch.total} reçu` : `${results.length} codes lus`, detail: `${summaryText(results)} — total : ${total}` };
    }
    const r = results[0];
    if (!r) return { status: 'invalid', title: 'Code illisible' };
    const titles: Record<string, string> = {
      accepted: '✓ Réponse acceptée',
      duplicate: 'Déjà reçue — doublon ignoré',
      conflict: 'Identifiant déjà utilisé',
      invalid: 'Code invalide',
    };
    return { status: r.status, title: titles[r.status], detail: `${r.message}${r.status === 'accepted' ? ` · total : ${total}` : ''}` };
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-4 md:px-6">
      <header className="flex flex-wrap items-center gap-4">
        <Brand size="md" />
        <span className="chip !border-amber-400/40 !text-amber-200">Animateur · local</span>
        <nav className="ml-auto flex flex-wrap gap-2">
          <a className="btn btn-ghost" href={route('qr')} target="eureka26-qr" data-testid="open-qr">
            <QrIcon size={18} /> Écran QR <ExternalLink size={14} />
          </a>
          <a className="btn btn-primary" href={route('results')} target="eureka26-results" data-testid="open-results">
            <MonitorPlay size={18} /> Écran résultats <ExternalLink size={14} />
          </a>
        </nav>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Compteurs">
        <Counter label="Acceptées" value={session.submissions.length} accent testId="count-accepted" />
        <Counter label="Complètes" value={complete} />
        <Counter label="Doublons" value={session.duplicates} testId="count-duplicates" />
        <Counter label="Conflits" value={session.conflicts} />
        <Counter label="Votes manuels" value={manualTotal} />
      </section>

      <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
        <Info size={16} className="shrink-0" aria-hidden="true" />
        {syncAvailable() ? 'Synchronisé avec /results et /qr dans ce navigateur uniquement.' : 'Synchronisation : ce navigateur uniquement.'}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Sections de l’interface animateur">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              data-testid={`tab-${t.id}`}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-left font-semibold transition-colors ${
                tab === t.id ? 'bg-cyan-400/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgb(34_211_238/0.45)]' : 'text-ink-2 hover:bg-panel'
              }`}
            >
              <t.icon size={18} aria-hidden="true" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === 'collect' && <CollectPanel onScan={onScan} ingest={ingest} apply={apply} session={session} />}
          {tab === 'submissions' && <SubmissionsPanel session={session} apply={apply} />}
          {tab === 'manual' && <ManualPanel session={session} apply={apply} sequence={sequence} />}
          {tab === 'questions' && <QuestionsPanel config={config} setConfig={setConfig} />}
          {tab === 'remote' && <RemotePanel presentation={presentation} setPresentation={setPresentation} sequence={sequence} />}
          {tab === 'backup' && <BackupPanel session={session} apply={apply} sequence={sequence} resetPresentation={() => setPresentation(defaultPresentation())} />}
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value, accent, testId }: { label: string; value: number; accent?: boolean; testId?: string }) {
  return (
    <div className={`glass rounded-2xl p-4 ${accent ? '!border-emerald-400/40' : ''}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${accent ? 'text-emerald-300' : ''}`} data-testid={testId} aria-live="polite">
        {value}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children, desc }: { title: string; icon: typeof Camera; children: React.ReactNode; desc?: string }) {
  return (
    <section className="glass rounded-3xl p-5">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <Icon size={20} className="text-cyan-300" aria-hidden="true" /> {title}
      </h2>
      {desc && <p className="mt-1 text-sm text-ink-2">{fr(desc)}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResultList({ results }: { results: IngestResult[] }) {
  if (!results.length) return null;
  const tone: Record<string, string> = { accepted: 'text-emerald-300', duplicate: 'text-amber-300', conflict: 'text-amber-300', invalid: 'text-rose-300' };
  return (
    <div className="mt-3 rounded-xl border border-edge bg-void/40 p-3 text-sm" data-testid="import-results">
      <p className="font-semibold">{summaryText(results)}</p>
      <ul className="mt-2 max-h-48 space-y-1 overflow-auto scrollbar-thin font-mono text-xs">
        {results.map((r, i) => (
          <li key={i} className={tone[r.status]}>
            {r.id ?? r.code.slice(0, 24)} — {r.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CollectPanel({
  onScan,
  ingest,
  apply,
  session,
}: {
  onScan: (t: string, via: 'camera' | 'image') => ScanFeedback;
  ingest: (t: string, via: Via) => { results: IngestResult[]; session: SessionData };
  apply: Apply;
  session: SessionData;
}) {
  const [text, setText] = useState('');
  const [pasteResults, setPasteResults] = useState<IngestResult[]>([]);
  const [fileResults, setFileResults] = useState<IngestResult[]>([]);
  const [fileMsg, setFileMsg] = useState('');

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const all: IngestResult[] = [];
    const notes: string[] = [];
    for (const file of Array.from(files)) {
      const content = await file.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        /* not JSON: treat as text */
      }
      if (parsed && (parsed as SessionData).format === 'eureka26-session') {
        try {
          const other = parseSessionJSON(parsed);
          all.push(...apply((prev) => mergeSessions(prev, other)).results);
          notes.push(`${file.name} : session fusionnée`);
        } catch (e) {
          notes.push(`${file.name} : ${(e as Error).message}`);
        }
        continue;
      }
      const codes = parsed ? codesFromJSON(parsed) : extractCodes(content);
      if (!codes.length) {
        notes.push(`${file.name} : aucun code EUREKA26 trouvé`);
        continue;
      }
      all.push(...ingest(codes.join('\n'), 'json').results);
    }
    setFileResults(all);
    setFileMsg(notes.join(' · '));
  };

  const recent = session.log.slice(0, 8);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <Panel title="Scanner" icon={Camera}>
        <Scanner onText={onScan} />
        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-3">Journal</h3>
          <ul className="mt-2 space-y-1 text-sm" data-testid="recent-log">
            {recent.length === 0 && <li className="text-ink-3">—</li>}
            {recent.map((l, i) => (
              <li key={i} className={l.kind === 'accepted' ? 'text-emerald-300' : l.kind === 'invalid' ? 'text-rose-300' : l.kind === 'info' ? 'text-ink-2' : 'text-amber-300'}>
                <span className="text-ink-3 tabular-nums">{formatTime(l.at)}</span> — {l.message}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Coller des codes" icon={ClipboardPaste}>
          <textarea className="field min-h-[140px] font-mono !text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="E26-1C-XXXXXXXX-…" aria-label="Codes de réponse à importer" data-testid="paste-input" />
          <button
            type="button"
            className="btn btn-primary mt-3"
            disabled={!text.trim()}
            onClick={() => {
              const { results } = ingest(text, 'paste');
              setPasteResults(results.length ? results : [{ status: 'invalid', code: text.slice(0, 30), message: 'Aucun code EUREKA26 trouvé dans le texte' }]);
              if (results.some((r) => r.status === 'accepted')) setText('');
            }}
            data-testid="paste-submit"
          >
            <ClipboardPaste size={18} /> Importer les codes
          </button>
          <ResultList results={pasteResults} />
        </Panel>

        <Panel title="Fichiers" icon={Upload}>
          <label className="btn btn-ghost cursor-pointer">
            <FileJson size={18} /> Choisir des fichiers…
            <input type="file" accept=".json,.txt,.csv,application/json,text/plain" multiple className="sr-only" onChange={(e) => onFiles(e.target.files).finally(() => (e.target.value = ''))} data-testid="file-input" />
          </label>
          {fileMsg && <p className="mt-2 text-sm text-ink-2">{fileMsg}</p>}
          <ResultList results={fileResults} />
        </Panel>
      </div>
    </div>
  );
}

function SubmissionsPanel({ session, apply }: { session: SessionData; apply: Apply }) {
  const [filter, setFilter] = useState('');
  const rows = [...session.submissions].reverse().filter((s) => !filter || s.id.includes(filter.toUpperCase()));
  const logIssues = session.log.filter((l) => l.kind === 'duplicate' || l.kind === 'conflict' || l.kind === 'invalid').slice(0, 30);
  return (
    <div className="space-y-5">
      <Panel title={`Réponses : ${session.submissions.length}`} icon={Users}>
        <input className="field mb-3 !w-64" placeholder="Filtrer par identifiant…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par identifiant" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm" data-testid="submissions-table">
            <thead className="text-ink-3">
              <tr>
                <th className="py-2">Identifiant</th>
                <th className="py-2">Reçu à</th>
                <th className="py-2">Source</th>
                <th className="py-2">Statut</th>
                <th className="py-2 text-right">Score</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-3">
                    —
                  </td>
                </tr>
              )}
              {rows.map((s) => {
                const sc = scoreOf(s);
                return (
                  <tr key={s.id} className="border-t border-edge">
                    <td className="py-2 font-mono">{s.id}</td>
                    <td className="py-2 tabular-nums text-ink-2">{formatTime(s.receivedAt)}</td>
                    <td className="py-2 text-ink-2">{{ camera: 'Caméra', image: 'Photo', paste: 'Collage', json: 'Fichier', batch: 'Lot QR' }[s.via]}</td>
                    <td className="py-2">{s.complete ? <span className="text-emerald-300">Complet</span> : <span className="text-amber-300">Partiel</span>}</td>
                    <td className="py-2 text-right tabular-nums">
                      {sc.correct}/{sc.answered}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-ink-3 hover:bg-rose-500/15 hover:text-rose-300"
                        onClick={() => confirm(`Supprimer la réponse ${s.id} ?`) && apply((prev) => ({ session: removeSubmission(prev, s.id) }))}
                        aria-label={`Supprimer ${s.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={`Doublons : ${session.duplicates} · conflits : ${session.conflicts}`} icon={RefreshCw}>
        <ul className="space-y-1 text-sm" data-testid="issues-log">
          {logIssues.length === 0 && <li className="text-ink-3">—</li>}
          {logIssues.map((l, i) => (
            <li key={i} className={l.kind === 'invalid' ? 'text-rose-300' : 'text-amber-300'}>
              <span className="tabular-nums text-ink-3">{formatTime(l.at)}</span> — {l.message}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function ManualPanel({ session, apply, sequence }: { session: SessionData; apply: Apply; sequence: string[] }) {
  const [qid, setQid] = useState(sequence[0] ?? 'Q01');
  const q = QUESTION_BY_ID[qid];
  const counts = session.manual[qid] ?? [0, 0, 0, 0];
  const set = (i: number, v: number) => {
    const next = [...counts] as [number, number, number, number];
    next[i] = Math.max(0, Math.floor(v || 0));
    apply((prev) => ({ session: setManualCounts(prev, qid, next) }));
  };
  return (
    <Panel
      title="Votes collectés manuellement"
      icon={Hand}
    >
      <label className="text-sm font-semibold text-ink-2" htmlFor="manual-q">
        Question
      </label>
      <select id="manual-q" className="field mt-1" value={qid} onChange={(e) => setQid(e.target.value)} data-testid="manual-question">
        {sequence.map((id, i) => (
          <option key={id} value={id}>
            {i + 1}. {QUESTION_BY_ID[id].short} {session.manual[id] ? '✓' : ''}
          </option>
        ))}
      </select>
      <p className="mt-3 font-medium">{fr(q.question)}</p>
      <ul className="mt-3 space-y-2">
        {q.choices.map((c, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-edge bg-panel/50 p-2 pl-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-display font-bold">{LETTERS[i]}</span>
            <span className="flex-1 text-sm">{fr(c)}</span>
            <button type="button" className="btn btn-ghost !min-h-[40px] !px-3" onClick={() => set(i, counts[i] - 1)} aria-label={`Retirer un vote ${LETTERS[i]}`}>
              −
            </button>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className="field !w-24 text-center tabular-nums"
              value={counts[i]}
              onChange={(e) => set(i, Number(e.target.value))}
              aria-label={`Votes manuels pour ${LETTERS[i]}`}
              data-testid={`manual-${LETTERS[i]}`}
            />
            <button type="button" className="btn btn-ghost !min-h-[40px] !px-3" onClick={() => set(i, counts[i] + 1)} aria-label={`Ajouter un vote ${LETTERS[i]}`}>
              +
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-ghost mt-3" onClick={() => apply((prev) => ({ session: setManualCounts(prev, qid, [0, 0, 0, 0]) }))}>
        <Trash2 size={16} /> Effacer les votes manuels de cette question
      </button>
    </Panel>
  );
}

function QuestionsPanel({ config, setConfig }: { config: ReturnType<typeof defaultConfig>; setConfig: (fn: (prev: ReturnType<typeof defaultConfig>) => ReturnType<typeof defaultConfig>) => void }) {
  const enabled = new Set(config.enabled);
  const sequence = activeSequence(config);
  const url = invitationUrl(sequence, config.inviteUrl, config.phoneFeedback);
  const [urlDraft, setUrlDraft] = useState(config.inviteUrl ?? '');
  const move = (i: number, d: -1 | 1) =>
    setConfig((prev) => {
      const order = [...prev.order];
      const j = i + d;
      if (j < 0 || j >= order.length) return prev;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...prev, order };
    });
  const toggle = (id: string) =>
    setConfig((prev) => ({ ...prev, enabled: prev.enabled.includes(id) ? prev.enabled.filter((x) => x !== id) : [...prev.enabled, id] }));

  return (
    <div className="space-y-5">
      <Panel
        title={`Questions actives : ${sequence.length}`}
        icon={ListChecks}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setConfig((p) => ({ ...p, order: [...FULL_SEQUENCE], enabled: [...DEFAULT_SEQUENCE] }))} data-testid="preset-default">
            Toutes ({DEFAULT_SEQUENCE.length})
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setConfig((p) => ({ ...p, enabled: [] }))}>
            Tout désactiver
          </button>
        </div>
        {sequence.length === 0 && <p className="mb-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">Aucune question active.</p>}
        <ol className="space-y-1.5" data-testid="question-config">
          {config.order.map((id, i) => {
            const q = QUESTION_BY_ID[id];
            const on = enabled.has(id);
            return (
              <li key={id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${on ? 'border-cyan-400/30 bg-cyan-400/[0.05]' : 'border-edge bg-panel/40 opacity-70'}`}>
                <input type="checkbox" className="h-5 w-5 accent-cyan-400" checked={on} onChange={() => toggle(id)} aria-label={`Activer ${q.id}`} data-testid={`enable-${q.id}`} />
                <span className="w-10 font-mono text-xs text-ink-3">{q.id}</span>
                <span className="hidden sm:inline">
                  <CategoryChip category={q.category} />
                </span>
                <span className="flex-1 text-sm" title={q.question}>
                  {fr(q.short)}
                </span>
                {on && <span className="text-xs tabular-nums text-cyan-300">#{sequence.indexOf(id) + 1}</span>}
                <button type="button" className="rounded-lg p-1.5 hover:bg-panel-2 disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter ${q.id}`}>
                  <ArrowUp size={16} />
                </button>
                <button type="button" className="rounded-lg p-1.5 hover:bg-panel-2 disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === config.order.length - 1} aria-label={`Descendre ${q.id}`}>
                  <ArrowDown size={16} />
                </button>
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="Invitation" icon={QrIcon}>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-cyan-400" checked={config.phoneFeedback} onChange={(e) => setConfig((p) => ({ ...p, phoneFeedback: e.target.checked }))} data-testid="phone-feedback" />
          <span>Correction après chaque question sur les téléphones</span>
        </label>
        <div className="mt-4">
          <label className="text-sm font-semibold text-ink-2" htmlFor="invite-url">
            URL publique
          </label>
          <div className="mt-1 flex gap-2">
            <input id="invite-url" className="field" value={urlDraft} placeholder={PUBLIC_URL} onChange={(e) => setUrlDraft(e.target.value)} />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfig((p) => ({ ...p, inviteUrl: /^https?:\/\//.test(urlDraft.trim()) ? urlDraft.trim() : null }))}
            >
              Appliquer
            </button>
          </div>
        </div>
        <p className="mt-3 break-all rounded-xl border border-edge bg-void/50 p-3 font-mono text-sm" data-testid="invite-preview">
          {url}
        </p>
        {isLocalhost(url) && <p className="mt-2 text-sm text-amber-300">URL locale.</p>}
        <div className="mt-4">
          <label className="text-sm font-semibold text-ink-2" htmlFor="autoplay">
            Diaporama (secondes)
          </label>
          <input
            id="autoplay"
            type="number"
            min={4}
            max={120}
            className="field mt-1 !w-28"
            value={config.autoplaySeconds}
            onChange={(e) => setConfig((p) => ({ ...p, autoplaySeconds: Math.min(120, Math.max(4, Number(e.target.value) || 12)) }))}
          />
        </div>
      </Panel>
    </div>
  );
}

function BackupPanel({
  session,
  apply,
  sequence,
  resetPresentation,
}: {
  session: SessionData;
  apply: Apply;
  sequence: string[];
  resetPresentation: () => void;
}) {
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [msg, setMsg] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [transfer, setTransfer] = useState(false);
  const [pinDraft, setPinDraft] = useState('');
  const [hasPin, setHasPin] = useState(() => !!readJSON<string | null>(KEYS.pin, null));
  const stamp = timestampForFile();

  const restore = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const other = parseSessionJSON(JSON.parse(await file.text()));
      if (restoreMode === 'replace') {
        apply(() => ({ session: other }));
        setMsg(`Session restaurée : ${other.submissions.length} réponse(s).`);
      } else {
        const res = apply((prev) => mergeSessions(prev, other)).results;
        setMsg(`Fusion : ${summaryText(res)}.`);
      }
    } catch (e) {
      setMsg(`Échec : ${(e as Error).message}`);
    }
  };

  return (
    <div className="space-y-5">
      <Panel title="Exports" icon={FileSpreadsheet}>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => downloadFile(`eureka26-resultats-agreges-${stamp}.csv`, aggregatedCSV(session, sequence), 'text/csv;charset=utf-8')} data-testid="export-aggregate-csv">
            <FileSpreadsheet size={18} /> Résultats agrégés (CSV)
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadFile(`eureka26-reponses-${stamp}.csv`, submissionsCSV(session), 'text/csv;charset=utf-8')} data-testid="export-submissions-csv">
            <FileSpreadsheet size={18} /> Réponses individuelles anonymes (CSV)
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadFile(`eureka26-resultats-agreges-${stamp}.json`, JSON.stringify(aggregatedJSON(session, sequence), null, 2), 'application/json')} data-testid="export-aggregate-json">
            <FileJson size={18} /> Résultats agrégés (JSON)
          </button>
        </div>
      </Panel>

      <Panel title="Session" icon={Database}>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={() => downloadFile(`eureka26-session-${stamp}.json`, JSON.stringify(session, null, 2), 'application/json')} data-testid="export-session">
            <Database size={18} /> Exporter la session complète (JSON)
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setTransfer(true)} disabled={!session.submissions.length} data-testid="open-transfer">
            <QrIcon size={18} /> Transférer par QR codes
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select className="field !w-auto" value={restoreMode} onChange={(e) => setRestoreMode(e.target.value as 'merge' | 'replace')} aria-label="Mode de restauration" data-testid="restore-mode">
            <option value="merge">Fusionner avec la session actuelle</option>
            <option value="replace">Remplacer la session actuelle</option>
          </select>
          <label className="btn btn-ghost cursor-pointer">
            <Upload size={18} /> Restaurer depuis un fichier…
            <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => restore(e.target.files).finally(() => (e.target.value = ''))} data-testid="restore-input" />
          </label>
        </div>
        {msg && (
          <p className="mt-3 text-sm text-ink-2" role="status" data-testid="restore-msg">
            {msg}
          </p>
        )}
      </Panel>

      <Panel title="Réinitialiser" icon={Trash2}>
        <div className="flex flex-wrap items-center gap-2">
          <input className="field !w-56" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Tapez EFFACER" aria-label="Confirmation de réinitialisation" data-testid="reset-confirm" />
          <button
            type="button"
            className="btn btn-danger"
            disabled={confirmText.trim().toUpperCase() !== 'EFFACER'}
            onClick={() => {
              apply(() => ({ session: emptySession() }));
              resetPresentation();
              setConfirmText('');
              setMsg('Résultats locaux réinitialisés.');
            }}
            data-testid="reset"
          >
            <Trash2 size={18} /> Réinitialiser
          </button>
        </div>
      </Panel>

      <Panel title="Code PIN local (confort, pas une sécurité)" icon={Lock}>
        {hasPin ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              removeKey(KEYS.pin);
              setHasPin(false);
            }}
          >
            Supprimer le code PIN
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input className="field !w-40" type="password" inputMode="numeric" value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} placeholder="4 chiffres ou plus" aria-label="Nouveau code PIN" />
            <button
              type="button"
              className="btn btn-ghost"
              disabled={pinDraft.length < 4}
              onClick={async () => {
                writeJSON(KEYS.pin, await sha256(pinDraft));
                try {
                  sessionStorage.setItem('eureka26:unlocked', '1');
                } catch {
                  /* ignore */
                }
                setPinDraft('');
                setHasPin(true);
              }}
            >
              Définir le code PIN
            </button>
          </div>
        )}
      </Panel>

      {transfer && <BatchTransfer codes={session.submissions.map((s) => s.code)} onClose={() => setTransfer(false)} />}
    </div>
  );
}

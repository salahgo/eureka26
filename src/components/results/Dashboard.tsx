import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FlaskConical,
  Keyboard,
  LayoutGrid,
  ListChecks,
  Maximize,
  Minimize,
  Pause,
  Play,
  Rocket,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { FACTS } from '../../data/facts';
import { activeSequence, nextState, type DashboardView, type PresentationState } from '../../lib/config';
import { overview, questionStats } from '../../lib/aggregate';
import { demoSubmissions } from '../../lib/demo';
import { invitationUrl } from '../../lib/urls';
import Brand from '../common/Brand';
import { useFullscreen, useInterval } from '../common/hooks';
import { useConfig, usePresentation, useSession } from '../common/shared';
import FactsView from './FactsView';
import FutureView from './FutureView';
import OverviewView from './OverviewView';
import QuestionView from './QuestionView';
import RevealOverlay from './RevealOverlay';

const NO_MANUAL = {};

const VIEWS: { id: DashboardView; label: string; key: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Vue d’ensemble', key: '1', icon: LayoutGrid },
  { id: 'question', label: 'Questions', key: '2', icon: ListChecks },
  { id: 'facts', label: 'Chiffres chocs', key: '3', icon: Zap },
  { id: 'future', label: 'Futur', key: '4', icon: Rocket },
];

export default function Dashboard() {
  const [session] = useSession();
  const [config] = useConfig();
  const [p, setP] = usePresentation();
  const [help, setHelp] = useState(false);
  const { isFullscreen, toggle: toggleFullscreen, supported: fsSupported } = useFullscreen();
  const sequence = useMemo(() => activeSequence(config), [config]);
  const seqKey = sequence.join(',');

  const demo = useMemo(() => (p.demo ? demoSubmissions(sequence) : null), [p.demo, seqKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const submissions = demo ?? session.submissions;
  const manual = demo ? NO_MANUAL : session.manual;
  const ov = useMemo(() => overview(sequence, submissions, manual), [sequence, submissions, manual]);
  const perQuestion = useMemo(() => sequence.map((id) => questionStats(id, submissions, manual)), [sequence, submissions, manual]);
  const pos = Math.min(p.pos, Math.max(0, sequence.length - 1));
  const currentId = sequence[pos];
  const stats = useMemo(() => (currentId ? questionStats(currentId, submissions, manual) : null), [currentId, submissions, manual]);

  const act = useCallback((patch: Partial<PresentationState>) => setP((prev) => ({ ...prev, ...patch, nonce: prev.nonce + 1 })), [setP]);
  const step = useCallback((cmd: 'next' | 'prev') => setP((prev) => ({ ...prev, ...nextState(prev, cmd, sequence.length), nonce: prev.nonce + 1 })), [setP, sequence.length]);

  useInterval(
    () => {
      setP((prev) => {
        if (prev.view === 'question') {
          if (!prev.revealed) return { ...prev, revealed: true, nonce: prev.nonce + 1 };
          if (prev.pos + 1 >= sequence.length) return { ...prev, view: 'facts', factIndex: 0, spotlight: true, nonce: prev.nonce + 1 };
          return { ...prev, pos: prev.pos + 1, revealed: false, explanation: false, nonce: prev.nonce + 1 };
        }
        if (prev.view === 'facts') {
          if (prev.factIndex + 1 >= FACTS.length) return { ...prev, view: 'future', spotlight: false, nonce: prev.nonce + 1 };
          return { ...prev, factIndex: prev.factIndex + 1, spotlight: true, nonce: prev.nonce + 1 };
        }
        const order: DashboardView[] = ['overview', 'question', 'facts', 'future'];
        const next = order[(order.indexOf(prev.view) + 1) % order.length];
        return { ...prev, view: next, pos: next === 'question' ? 0 : prev.pos, revealed: false, nonce: prev.nonce + 1 };
      });
    },
    p.autoplay ? config.autoplaySeconds * 1000 : null,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      const k = e.key;
      const view = VIEWS.find((v) => v.key === k);
      if (view) return act({ view: view.id, revealMode: false, spotlight: false });
      switch (k) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          return step('next');
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          return step('prev');
        case ' ':
        case 'Enter':
          if (p.view === 'question') {
            e.preventDefault();
            return act({ revealed: !p.revealed });
          }
          if (p.view === 'facts') {
            e.preventDefault();
            return act({ spotlight: !p.spotlight });
          }
          return;
        case 'e':
        case 'E':
          return act({ explanation: !p.explanation, revealed: p.explanation ? p.revealed : true });
        case 'r':
        case 'R':
          if (p.view === 'facts') return act({ spotlight: !p.spotlight });
          return act({ view: 'question', revealMode: !p.revealMode, revealed: true });
        case 'o':
        case 'O':
        case 'Home':
          return act({ view: 'overview', revealMode: false, spotlight: false });
        case 'f':
        case 'F':
          return void toggleFullscreen();
        case 'a':
        case 'A':
          return act({ autoplay: !p.autoplay });
        case 't':
        case 'T':
          return act({ table: !p.table });
        case 'd':
        case 'D':
          return act({ demo: !p.demo });
        case '?':
        case 'h':
        case 'H':
          return setHelp((h) => !h);
        case 'Escape':
          setHelp(false);
          if (p.revealMode || p.spotlight) return act({ revealMode: false, spotlight: false });
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, act, step, toggleFullscreen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden px-[1.6rem] py-[1rem]" data-testid="dashboard" data-view={p.view} data-demo={p.demo ? 'true' : 'false'}>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Brand size="md" />
        <nav className="flex flex-wrap gap-1 rounded-2xl border border-edge bg-panel/60 p-1" aria-label="Sections du tableau de bord">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => act({ view: v.id, revealMode: false, spotlight: false })}
              aria-current={p.view === v.id ? 'page' : undefined}
              data-testid={`view-${v.id}`}
              className={`flex items-center gap-2 rounded-xl px-[0.9rem] py-[0.5rem] text-[0.98rem] font-semibold transition-colors ${
                p.view === v.id ? 'bg-cyan-400/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgb(34_211_238/0.45)]' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <v.icon size={18} aria-hidden="true" />
              {v.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <DataBadge demo={p.demo} count={submissions.length} manual={ov.manualVotes} />
          {p.view === 'question' && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => act({ revealed: !p.revealed })} data-testid="toggle-reveal" aria-label={p.revealed ? 'Masquer la réponse' : 'Révéler la réponse'} title="Espace">
                {p.revealed ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => act({ revealMode: true, revealed: true })} data-testid="reveal-mode" title="REVEAL plein écran (R)">
                <Sparkles size={18} /> REVEAL
              </button>
            </>
          )}
          <button type="button" className={`btn btn-ghost ${p.autoplay ? '!border-cyan-400/60 !text-cyan-200' : ''}`} onClick={() => act({ autoplay: !p.autoplay })} data-testid="autoplay" aria-label="Diaporama automatique" title="A">
            {p.autoplay ? <Pause size={18} /> : <Play size={18} />}
          </button>
          {fsSupported && (
            <button type="button" className="btn btn-ghost" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'} data-testid="fullscreen" title="Plein écran (F)">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setHelp(true)} aria-label="Raccourcis clavier" title="Aide (?)">
            <Keyboard size={18} />
          </button>
        </div>
      </header>

      {p.demo && (
        <div className="mt-3 flex items-center justify-center gap-3 rounded-xl border-2 border-amber-400 bg-amber-400/15 px-4 py-2 text-center text-[1.15rem] font-bold uppercase tracking-[0.2em] text-amber-200" role="status" data-testid="demo-banner">
          <FlaskConical size={22} aria-hidden="true" /> MODE DÉMONSTRATION — données fictives
          <button type="button" className="ml-2 rounded-lg border border-amber-300/60 p-1" onClick={() => act({ demo: false })} aria-label="Quitter le mode démonstration">
            <X size={16} />
          </button>
        </div>
      )}

      <main className="relative mt-[1.1rem] min-h-0 flex-1 overflow-y-auto scrollbar-thin lg:overflow-hidden">
        {p.view === 'overview' && <OverviewView ov={ov} perQuestion={perQuestion} inviteUrl={invitationUrl(sequence, config.inviteUrl, config.phoneFeedback)} nonce={p.nonce} table={p.table} />}
        {p.view === 'question' &&
          (stats ? (
            <QuestionView stats={stats} position={pos} total={sequence.length} revealed={p.revealed} explanation={p.explanation} table={p.table} nonce={p.nonce} />
          ) : (
            <p className="text-ink-2">Aucune question active : activez des questions dans /admin.</p>
          ))}
        {p.view === 'facts' && (
          <FactsView
            factIndex={p.factIndex}
            spotlight={p.spotlight}
            nonce={p.nonce}
            onSelect={(i) => act({ factIndex: i, spotlight: true })}
            onClose={() => act({ spotlight: false })}
          />
        )}
        {p.view === 'future' && <FutureView />}
      </main>

      <footer className="mt-[0.9rem] flex min-h-[2.4rem] flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem] text-ink-3">
        {p.view === 'question' && (
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost !min-h-[36px] !px-3 !py-1" onClick={() => step('prev')} disabled={pos === 0} aria-label="Question précédente" data-testid="prev">
              <ChevronLeft size={18} />
            </button>
            <span className="font-display text-[1rem] font-semibold text-ink-2 tabular-nums">
              {pos + 1} / {sequence.length}
            </span>
            <button type="button" className="btn btn-ghost !min-h-[36px] !px-3 !py-1" onClick={() => step('next')} disabled={pos >= sequence.length - 1} aria-label="Question suivante" data-testid="next">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </footer>

      {p.revealMode && p.view === 'question' && stats && <RevealOverlay stats={stats} nonce={p.nonce} onClose={() => act({ revealMode: false })} />}
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
    </div>
  );
}

function DataBadge({ demo, count, manual }: { demo: boolean; count: number; manual: number }) {
  if (demo)
    return (
      <span className="chip !border-amber-400/70 !bg-amber-400/15 !text-amber-200" data-testid="data-badge">
        <FlaskConical size={14} /> MODE DÉMONSTRATION
      </span>
    );
  if (count === 0 && manual === 0)
    return (
      <span className="chip" data-testid="data-badge">
        <span className="h-2 w-2 rounded-full bg-slate-500" /> Aucune réponse collectée
      </span>
    );
  return (
    <span className="chip !border-emerald-400/40 !text-emerald-200" data-testid="data-badge">
      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" /> {count} réponse{count > 1 ? 's' : ''} collectée{count > 1 ? 's' : ''}
      {manual > 0 && ` · ${manual} manuels`}
    </span>
  );
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['← / →', 'Question, chiffre ou section précédente / suivante'],
    ['Espace / Entrée', 'Révéler ou masquer la réponse'],
    ['E', 'Afficher / masquer l’explication'],
    ['R', 'Mode REVEAL plein écran (ou chiffre en plein écran)'],
    ['1 … 4', 'Vue d’ensemble · Questions · Chiffres chocs · Futur'],
    ['O / Début', 'Retour à la vue d’ensemble'],
    ['A', 'Diaporama automatique'],
    ['F', 'Plein écran'],
    ['T', 'Afficher les tableaux de données'],
    ['D', 'MODE DÉMONSTRATION (données fictives)'],
    ['Échap', 'Fermer'],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-void/85 p-6 backdrop-blur" role="dialog" aria-modal="true" aria-label="Raccourcis clavier" onClick={onClose}>
      <div className="glass w-full max-w-2xl rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Raccourcis clavier</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[1.05rem]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt>
                <span className="kbd">{k}</span>
              </dt>
              <dd className="text-ink-2">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

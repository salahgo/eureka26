import { useMemo, useState } from 'react';
import { BookOpen, Briefcase, Check, ChevronDown, Copy, Download, QrCode as QrIcon, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { FACTS } from '../../data/facts';
import { getSource } from '../../data/sources';
import { fr, formatNumber } from '../../lib/format';
import { downloadFile } from '../../lib/storage';
import { route } from '../../lib/urls';
import type { ParticipantExport } from '../../lib/session';
import Brand from '../common/Brand';
import QrCode from '../common/QrCode';
import { copyText, useCountUp } from '../common/hooks';
import { responseCode, type ParticipantState } from './participant';

const TAKEAWAYS = [
  'La cybersécurité est une responsabilité de direction, pas seulement un sujet informatique.',
  'Disponibilité, continuité (RTO/RPO) et dépendances fournisseurs se décident au niveau des métiers.',
  'Un agent IA doit avoir une identité, des droits minimaux, une traçabilité et un responsable humain.',
  'La souveraineté numérique, c’est la maîtrise des données, des clés et des décisions — pas seulement leur localisation.',
  'Zero Trust, résilience et préparation post-quantique sont des chantiers à lancer dès maintenant.',
];

function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const ratio = total ? correct / total : 0;
  const animated = useCountUp(ratio, { duration: 1600 });
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(51 65 85 / 0.6)" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="url(#score-g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${animated * c} ${c}`} />
        <defs>
          <linearGradient id="score-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl font-bold" data-testid="score">
          {correct}
          <span className="text-2xl text-ink-3">/{total}</span>
        </div>
        <div className="text-sm text-ink-3">bonnes réponses</div>
      </div>
    </div>
  );
}

export default function ResultScreen({ state, onRestart }: { state: ParticipantState; onRestart: () => void }) {
  const code = useMemo(() => (Object.keys(state.answers).length ? responseCode(state) : null), [state]);
  const [copied, setCopied] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const answeredIds = state.sequence.filter((id) => state.answers[id] !== undefined);
  const correct = answeredIds.filter((id) => QUESTION_BY_ID[id].correct === state.answers[id]).length;
  const total = answeredIds.length;
  const ratio = total ? correct / total : 0;
  const tier =
    ratio >= 0.8
      ? { title: 'Cyber-manager averti·e', text: 'Vous connaissez la réalité des chiffres. Reste à convaincre le reste du comité de direction !' }
      : ratio >= 0.5
        ? { title: 'Bons réflexes', text: 'Vous avez les bases ; certains chiffres vous ont sans doute surpris. C’est exactement le but.' }
        : { title: 'La réalité dépasse la fiction', text: 'Ces chiffres surprennent presque tout le monde. Bonne nouvelle : vous ne les oublierez plus.' };

  const surprising = useMemo(() => {
    const missed = new Set(answeredIds.filter((id) => QUESTION_BY_ID[id].correct !== state.answers[id]));
    const ordered = [...FACTS].sort((a, b) => Number(missed.has(b.questionId ?? '')) - Number(missed.has(a.questionId ?? '')));
    return ordered.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.answers]);

  const exportJSON = () => {
    if (!code) return;
    const data: ParticipantExport = {
      format: 'eureka26-response',
      version: 1,
      code,
      complete: state.complete,
      answers: Object.fromEntries(answeredIds.map((id) => [id, LETTERS[state.answers[id]]])),
    };
    downloadFile(`eureka26-reponse-${state.id}.json`, JSON.stringify(data, null, 2), 'application/json');
  };

  return (
    <main className="mx-auto max-w-xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Brand size="sm" />
        <span className="chip">{state.complete ? 'Questionnaire terminé' : 'Questionnaire partiel'}</span>
      </header>

      <section className="rise mt-8 flex flex-col items-center text-center">
        <Trophy className="mb-3 text-amber-300" size={32} aria-hidden="true" />
        <ScoreRing correct={correct} total={total} />
        <h1 className="mt-5 font-display text-3xl font-bold">{tier.title}</h1>
        <p className="mt-2 max-w-md text-ink-2">{fr(tier.text)}</p>
      </section>

      {code && (
        <section className="rise glass mt-8 rounded-3xl p-5" style={{ animationDelay: '120ms' }} aria-labelledby="share-title">
          <h2 id="share-title" className="flex items-center gap-2 font-display text-xl font-bold">
            <QrIcon size={20} className="text-cyan-300" aria-hidden="true" /> Transmettez vos réponses à l’animateur
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {fr("Présentez ce QR code à la caméra de l'animateur : vos réponses rejoindront les résultats projetés. Il ne contient qu'un identifiant aléatoire et vos choix A/B/C/D — aucune donnée personnelle.")}
          </p>
          <div className="mx-auto mt-4 w-full max-w-[19rem] rounded-2xl bg-white p-3 shadow-[0_0_60px_-10px_rgb(34_211_238/0.5)]">
            <QrCode value={code} size="100%" ecc="M" label="QR code de vos réponses anonymes" testId="response-qr" />
          </div>
          <div className="mt-4">
            <label htmlFor="response-code" className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Code de réponse
            </label>
            <div className="mt-1 flex gap-2">
              <input id="response-code" readOnly value={code} className="field font-mono !text-sm" onFocus={(e) => e.currentTarget.select()} data-testid="response-code" />
              <button
                type="button"
                className="btn btn-ghost shrink-0"
                onClick={async () => {
                  setCopied(await copyText(code));
                  setTimeout(() => setCopied(false), 2000);
                }}
                aria-label="Copier le code"
              >
                {copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="mt-1 h-4 text-xs text-emerald-300" aria-live="polite">
              {copied ? 'Code copié !' : ''}
            </p>
          </div>
          <button type="button" className="btn btn-ghost mt-1 w-full" onClick={exportJSON} data-testid="export-json">
            <Download size={18} aria-hidden="true" /> Télécharger mes réponses (JSON)
          </button>
        </section>
      )}

      <section className="rise mt-8" style={{ animationDelay: '200ms' }} aria-labelledby="answers-title">
        <h2 id="answers-title" className="font-display text-xl font-bold">
          Vos réponses
        </h2>
        <ol className="mt-3 space-y-2">
          {state.sequence.map((id, i) => (
            <AnswerRow key={id} id={id} n={i + 1} answer={state.answers[id]} />
          ))}
        </ol>
      </section>

      <section className="rise mt-8" aria-labelledby="facts-title">
        <h2 id="facts-title" className="flex items-center gap-2 font-display text-xl font-bold">
          <Sparkles size={20} className="text-amber-300" aria-hidden="true" /> Les chiffres qui surprennent
        </h2>
        <div className="mt-3 grid gap-3">
          {surprising.map((f) => (
            <div key={f.id} className="glass rounded-2xl p-4">
              <div className="font-display text-3xl font-bold text-ink">
                {f.prefix}
                {formatNumber(f.value, f.decimals ?? 0)}
                {f.suffix && fr(f.suffix)}
              </div>
              <div className="mt-1 font-semibold">{fr(f.title)}</div>
              <p className="mt-1 text-sm text-ink-2">{fr(f.context)}</p>
              <p className="mt-2 text-xs text-ink-3">
                {getSource(f.sourceId).publisher} · {f.period}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rise mt-8 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5" aria-labelledby="take-title">
        <h2 id="take-title" className="flex items-center gap-2 font-display text-xl font-bold">
          <Briefcase size={20} className="text-emerald-300" aria-hidden="true" /> À retenir pour les managers
        </h2>
        <ul className="mt-3 space-y-2.5">
          {TAKEAWAYS.map((t) => (
            <li key={t} className="flex gap-2.5 leading-relaxed text-ink">
              <Check size={18} className="mt-1 shrink-0 text-emerald-300" aria-hidden="true" />
              {fr(t)}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-8 space-y-3">
        <a href={route('sources')} className="btn btn-ghost w-full">
          <BookOpen size={18} aria-hidden="true" /> Sources, méthodologie et glossaire
        </a>
        {confirmRestart ? (
          <div className="glass rounded-2xl p-4 text-center text-sm">
            <p>Recommencer effacera vos réponses de ce téléphone. Avez-vous transmis votre QR code ?</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" className="btn btn-danger" onClick={onRestart} data-testid="restart-confirm">
                Oui, recommencer
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmRestart(false)}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost w-full text-ink-2" onClick={() => setConfirmRestart(true)}>
            <RotateCcw size={16} aria-hidden="true" /> Recommencer le questionnaire
          </button>
        )}
      </footer>
    </main>
  );
}

function AnswerRow({ id, n, answer }: { id: string; n: number; answer: number | undefined }) {
  const q = QUESTION_BY_ID[id];
  const [open, setOpen] = useState(false);
  const status = answer === undefined ? 'skip' : answer === q.correct ? 'ok' : 'ko';
  return (
    <li className="glass rounded-2xl">
      <button type="button" className="flex w-full items-start gap-3 p-3.5 text-left" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            status === 'ok' ? 'bg-emerald-400/20 text-emerald-300' : status === 'ko' ? 'bg-rose-400/20 text-rose-300' : 'bg-slate-700/50 text-ink-3'
          }`}
        >
          {status === 'ok' ? <Check size={16} aria-label="Juste" /> : status === 'ko' ? <X size={16} aria-label="Faux" /> : '–'}
        </span>
        <span className="flex-1">
          <span className="block text-[0.95rem] font-medium leading-snug">
            {n}. {fr(q.question)}
          </span>
          <span className="mt-1 block text-sm text-ink-3">
            Bonne réponse : <span className="text-emerald-300">{LETTERS[q.correct]}. {fr(q.choices[q.correct])}</span>
            {status === 'ko' && (
              <>
                {' '}
                · Vous : {LETTERS[answer!]}
              </>
            )}
          </span>
        </span>
        <ChevronDown size={18} className={`mt-1 shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="space-y-2 px-3.5 pb-4 pl-[3.25rem] text-sm leading-relaxed text-ink-2">
          <p>{fr(q.explanation)}</p>
          <p className="text-emerald-200/90">
            <span className="font-semibold">Pour le manager : </span>
            {fr(q.managementInsight)}
          </p>
        </div>
      )}
    </li>
  );
}

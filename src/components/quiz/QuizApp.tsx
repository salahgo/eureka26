import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, Clock, Lock, RotateCcw, X } from 'lucide-react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import type { ChoiceIndex, Question } from '../../data/types';
import { fr } from '../../lib/format';
import { KEYS, writeJSON } from '../../lib/storage';
import { route } from '../../lib/urls';
import Brand from '../common/Brand';
import { CategoryChip } from '../common/categories';
import { useCountUp } from '../common/hooks';
import ResultScreen from './ResultScreen';
import { freshState, initialState, readParams, type ParticipantState } from './participant';

export default function QuizApp() {
  const [state, setState] = useState<ParticipantState>(initialState);
  const save = (next: ParticipantState) => {
    setState(next);
    writeJSON(KEYS.participant, next);
  };
  useEffect(() => {
    writeJSON(KEYS.participant, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = () => {
    const { sequence, feedback } = readParams();
    save(freshState(sequence, feedback));
    window.scrollTo({ top: 0 });
  };

  if (state.stage === 'welcome') return <Welcome state={state} onStart={() => save({ ...state, stage: 'question', startedAt: state.startedAt ?? Date.now() })} onRestart={restart} />;
  if (state.stage === 'done') return <ResultScreen state={state} onRestart={restart} />;
  return <QuestionFlow state={state} save={save} />;
}

function Welcome({ state, onStart, onRestart }: { state: ParticipantState; onStart: () => void; onRestart: () => void }) {
  const answered = Object.keys(state.answers).length;
  const total = state.sequence.length;
  const minutes = Math.max(3, Math.round(total * 0.35));
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Brand size="sm" />
        <a href={route('sources')} className="chip hover:text-ink" aria-label="Sources">
          <BookOpen size={14} aria-hidden="true" /> Sources
        </a>
      </header>

      <section className="rise relative flex flex-1 flex-col justify-center py-8">
        <div className="pointer-events-none absolute -left-10 top-1/4 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
        <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
          EUREKA<span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">26</span>
        </h1>
        <p className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-[1.7rem]">
          {fr('« Cyberattaques, IA et management : connaissez-vous vraiment les chiffres ? »')}
        </p>
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2" data-testid="quiz-meta">
          <span>{total} questions</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={16} aria-hidden="true" /> {minutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock size={16} aria-hidden="true" /> anonyme
          </span>
        </p>
      </section>

      <div className="rise space-y-3" style={{ animationDelay: '150ms' }}>
        <button type="button" className="btn btn-primary w-full !min-h-[60px] text-lg" onClick={onStart} data-testid="start">
          {answered > 0 ? `Reprendre (${Math.min(answered + 1, total)}/${total})` : 'Je relève le défi'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        {answered > 0 && (
          <button type="button" className="btn btn-ghost w-full" onClick={onRestart}>
            <RotateCcw size={16} aria-hidden="true" /> Recommencer
          </button>
        )}
      </div>
    </main>
  );
}

function Progress({ sequence, answers, pos }: { sequence: string[]; answers: Record<string, ChoiceIndex>; pos: number }) {
  return (
    <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={sequence.length} aria-valuenow={pos + 1} aria-label={`Question ${pos + 1} sur ${sequence.length}`}>
      {sequence.map((id, i) => (
        <span
          key={id}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            i === pos ? 'bg-cyan-300 shadow-[0_0_10px_rgb(34_211_238/0.8)]' : answers[id] !== undefined ? 'bg-sky-500/70' : 'bg-slate-700/60'
          }`}
        />
      ))}
    </div>
  );
}

function QuestionFlow({ state, save }: { state: ParticipantState; save: (s: ParticipantState) => void }) {
  const qid = state.sequence[state.pos];
  const q = QUESTION_BY_ID[qid];
  const locked = state.answers[qid];
  const [selected, setSelected] = useState<ChoiceIndex | null>(locked ?? null);
  const [confirmStop, setConfirmStop] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isLast = state.pos === state.sequence.length - 1;
  const showFeedback = state.feedback && locked !== undefined;
  const answeredCount = Object.keys(state.answers).length;

  useEffect(() => {
    setSelected(state.answers[qid] ?? null);
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  const finish = (complete: boolean) => save({ ...state, stage: 'done', complete, finishedAt: Date.now() });

  const goNext = (answers = state.answers) => {
    if (isLast) {
      save({ ...state, answers, stage: 'done', complete: state.sequence.every((id) => answers[id] !== undefined), finishedAt: Date.now() });
    } else {
      save({ ...state, answers, pos: state.pos + 1 });
    }
  };

  const validate = () => {
    if (selected === null) return;
    const answers = { ...state.answers, [qid]: selected };
    if (state.feedback) save({ ...state, answers });
    else goNext(answers);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Brand size="sm" />
          <div className="font-display text-sm font-semibold text-ink-2" aria-live="polite">
            <span className="text-xl text-ink">{state.pos + 1}</span>
            <span className="text-ink-3"> / {state.sequence.length}</span>
          </div>
        </div>
        <Progress sequence={state.sequence} answers={state.answers} pos={state.pos} />
      </header>

      <section key={qid} className="rise flex-1 pb-6 pt-6">
        <div className="mb-4">
          <CategoryChip category={q.category} />
        </div>
        <h1 ref={titleRef} tabIndex={-1} className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight outline-none sm:text-3xl" data-testid="question-title" data-question-id={q.id}>
          {fr(q.question)}
        </h1>

        <div
          className="mt-6 grid gap-3"
          role="radiogroup"
          aria-label="Choix de réponse"
          onKeyDown={(e) => {
            if (locked !== undefined || !['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
            e.preventDefault();
            const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : 3;
            const next = (((selected ?? (d === 1 ? 3 : 0)) + d) % 4) as ChoiceIndex;
            setSelected(next);
            (e.currentTarget.querySelectorAll('[role="radio"]')[next] as HTMLElement | undefined)?.focus();
          }}
        >
          {q.choices.map((choice, i) => (
            <ChoiceButton
              key={i}
              index={i as ChoiceIndex}
              text={choice}
              selected={selected === i}
              locked={locked !== undefined}
              feedback={showFeedback}
              correct={q.correct === i}
              anySelected={selected !== null}
              onSelect={() => locked === undefined && setSelected(i as ChoiceIndex)}
            />
          ))}
        </div>

        {showFeedback && <Feedback q={q} answer={locked} />}
      </section>

      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-edge bg-void/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        {locked === undefined ? (
          <button type="button" className="btn btn-primary w-full !min-h-[56px] text-lg" disabled={selected === null} onClick={validate} data-testid="validate">
            Valider <Check size={20} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full !min-h-[56px] text-lg" onClick={() => goNext()} data-testid="next">
            {isLast ? 'Mon résultat' : 'Suivante'} <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
        {answeredCount > 0 && (
          <div className="mt-2 text-center text-sm">
            {confirmStop ? (
              <span className="inline-flex items-center gap-3 text-ink-2">
                Terminer ?
                <button type="button" className="font-semibold text-cyan-300 underline" onClick={() => finish(false)} data-testid="stop-confirm">
                  Oui
                </button>
                <button type="button" className="text-ink-3 underline" onClick={() => setConfirmStop(false)}>
                  Non
                </button>
              </span>
            ) : (
              <button type="button" className="text-ink-3 underline-offset-4 hover:underline" onClick={() => setConfirmStop(true)} data-testid="stop">
                Terminer maintenant
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ChoiceButton({
  index,
  text,
  selected,
  locked,
  feedback,
  correct,
  anySelected,
  onSelect,
}: {
  index: ChoiceIndex;
  text: string;
  selected: boolean;
  locked: boolean;
  feedback: boolean;
  correct: boolean;
  anySelected: boolean;
  onSelect: () => void;
}) {
  let tone = 'border-edge bg-panel/70 hover:border-cyan-400/40';
  let badge = 'bg-slate-800 text-ink-2';
  if (selected && !feedback) {
    tone = 'border-cyan-300 bg-cyan-400/10 shadow-[0_0_0_1px_rgb(34_211_238/0.6),0_12px_40px_-12px_rgb(34_211_238/0.55)]';
    badge = 'bg-cyan-300 text-void';
  }
  if (feedback) {
    if (correct) {
      tone = 'border-emerald-400 bg-emerald-400/12 shadow-[0_0_0_1px_rgb(16_185_129/0.6)]';
      badge = 'bg-emerald-400 text-void';
    } else if (selected) {
      tone = 'border-rose-400/80 bg-rose-500/10';
      badge = 'bg-rose-400 text-void';
    } else {
      tone = 'border-edge bg-panel/40 opacity-55';
    }
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected || (index === 0 && !anySelected) ? 0 : -1}
      aria-disabled={locked}
      onClick={onSelect}
      data-testid={`choice-${LETTERS[index]}`}
      className={`group flex min-h-[64px] w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left text-[1.05rem] font-medium leading-snug transition-all duration-200 ${tone} ${
        selected && !feedback ? 'pop' : ''
      } ${locked ? 'cursor-default' : 'active:scale-[0.985]'}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold transition-colors ${badge}`}>
        {feedback && correct ? <Check size={20} aria-hidden="true" /> : feedback && selected ? <X size={20} aria-hidden="true" /> : LETTERS[index]}
      </span>
      <span className="flex-1">{fr(text)}</span>
      {feedback && correct && <span className="sr-only">(bonne réponse)</span>}
      {feedback && selected && !correct && <span className="sr-only">(votre réponse, incorrecte)</span>}
    </button>
  );
}

function NumericReveal({ q }: { q: Question }) {
  const n = q.numeric!;
  const value = useCountUp(n.value, { duration: 1400 });
  return (
    <span className="font-display text-4xl font-bold tracking-tight text-ink">
      {n.prefix}
      {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: n.decimals ?? 0, maximumFractionDigits: n.decimals ?? 0 }).format(value)}
      {n.suffix && <span className="text-2xl text-ink-2">{fr(n.suffix)}</span>}
    </span>
  );
}

/** Minimal correction: right/wrong and, for figures, the animated real number. */
function Feedback({ q, answer }: { q: Question; answer: ChoiceIndex }) {
  const good = answer === q.correct;
  return (
    <div className="rise mt-5 flex flex-wrap items-baseline justify-between gap-3" aria-live="polite" data-testid="feedback">
      <p className={`font-display text-xl font-bold ${good ? 'text-emerald-300' : 'text-amber-300'}`}>{good ? fr('Bonne réponse !') : fr(`Réponse : ${LETTERS[q.correct]}`)}</p>
      {q.numeric && <NumericReveal q={q} />}
    </div>
  );
}

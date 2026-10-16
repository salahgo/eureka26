import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Briefcase, Check, ChevronDown, Clock, Lock, RotateCcw, ShieldCheck, Lightbulb, Sparkles, X } from 'lucide-react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { getSource } from '../../data/sources';
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
        <a href={route('sources')} className="chip hover:text-ink">
          <BookOpen size={14} aria-hidden="true" /> Sources
        </a>
      </header>

      <section className="flex flex-1 flex-col justify-center py-8">
        <div className="rise relative">
          <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
          <p className="chip mb-5 !border-cyan-400/30 !text-cyan-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            Table ronde en direct
          </p>
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            EUREKA<span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">26</span>
          </h1>
          <p className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-[1.7rem]">
            {fr('« Cyberattaques, IA et management : connaissez-vous vraiment les chiffres ? »')}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">
            {fr('Des chiffres impressionnants, des attaques inattendues et des décisions que les managers ne peuvent plus ignorer. Prêt à tester vos connaissances ?')}
          </p>
        </div>

        <ul className="rise mt-8 grid grid-cols-3 gap-2 text-center text-sm" style={{ animationDelay: '120ms' }}>
          <li className="glass rounded-2xl px-2 py-3">
            <div className="font-display text-2xl font-bold text-ink">{total}</div>
            <div className="text-ink-3">questions</div>
          </li>
          <li className="glass rounded-2xl px-2 py-3">
            <div className="font-display text-2xl font-bold text-ink">
              <Clock className="mr-1 inline" size={18} aria-hidden="true" />~{minutes}
            </div>
            <div className="text-ink-3">minutes</div>
          </li>
          <li className="glass rounded-2xl px-2 py-3">
            <div className="font-display text-2xl font-bold text-ink">
              <Lock className="inline" size={20} aria-hidden="true" />
            </div>
            <div className="text-ink-3">anonyme</div>
          </li>
        </ul>
      </section>

      <div className="rise space-y-3" style={{ animationDelay: '220ms' }}>
        <button type="button" className="btn btn-primary w-full !min-h-[60px] text-lg" onClick={onStart} data-testid="start">
          {answered > 0 ? `Reprendre (question ${Math.min(answered + 1, total)}/${total})` : 'Je relève le défi'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        {answered > 0 && (
          <button type="button" className="btn btn-ghost w-full" onClick={onRestart}>
            <RotateCcw size={16} aria-hidden="true" /> Recommencer depuis le début
          </button>
        )}
        <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={16} aria-hidden="true" />
          {fr("Aucune inscription, aucun nom, aucun e-mail. Vos réponses restent sur votre téléphone jusqu'à ce que vous choisissiez de montrer votre QR code de réponses à l'animateur.")}
        </p>
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

  useEffect(() => {
    setSelected(state.answers[qid] ?? null);
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  const finish = (complete: boolean) =>
    save({ ...state, stage: 'done', complete, finishedAt: Date.now() });

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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <CategoryChip category={q.category} />
          <span className="chip" aria-label={`Difficulté ${q.difficulty} sur 3`}>
            {'●'.repeat(q.difficulty)}
            <span className="text-ink-3/60">{'●'.repeat(3 - q.difficulty)}</span>
          </span>
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
            Valider ma réponse <Check size={20} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full !min-h-[56px] text-lg" onClick={() => goNext()} data-testid="next">
            {isLast ? 'Voir mon résultat' : 'Question suivante'} <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
        <div className="mt-2 text-center">
          {confirmStop ? (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-ink-2">
              Terminer maintenant avec {Object.keys(state.answers).length} réponse(s) ?
              <button type="button" className="font-semibold text-cyan-300 underline" onClick={() => finish(false)} data-testid="stop-confirm">
                Oui, générer mon code
              </button>
              <button type="button" className="text-ink-3 underline" onClick={() => setConfirmStop(false)}>
                Non
              </button>
            </div>
          ) : (
            Object.keys(state.answers).length > 0 && (
              <button type="button" className="text-sm text-ink-3 underline-offset-4 hover:underline" onClick={() => setConfirmStop(true)}>
                Je dois partir : terminer maintenant
              </button>
            )
          )}
        </div>
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
  anySelected: boolean;
  text: string;
  selected: boolean;
  locked: boolean;
  feedback: boolean;
  correct: boolean;
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
    <div className="font-display text-4xl font-bold tracking-tight text-ink">
      {n.prefix}
      {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: n.decimals ?? 0, maximumFractionDigits: n.decimals ?? 0 }).format(value)}
      {n.suffix && <span className="text-2xl text-ink-2">{fr(n.suffix)}</span>}
    </div>
  );
}

function Feedback({ q, answer }: { q: Question; answer: ChoiceIndex }) {
  const [open, setOpen] = useState(false);
  const good = answer === q.correct;
  const sources = useMemo(() => q.sources.map((s) => getSource(s.id)), [q]);
  return (
    <div className="rise mt-5 space-y-3" aria-live="polite" data-testid="feedback">
      <div className={`glass rounded-2xl p-4 ${good ? '!border-emerald-400/40' : '!border-amber-400/40'}`}>
        <p className={`flex items-center gap-2 font-display text-lg font-bold ${good ? 'text-emerald-300' : 'text-amber-300'}`}>
          {good ? <Sparkles size={18} aria-hidden="true" /> : <Lightbulb size={18} aria-hidden="true" />}
          {good ? 'Bonne réponse !' : `Pas tout à fait… c'était ${LETTERS[q.correct]}`}
        </p>
        {q.numeric && (
          <div className="mt-2">
            <NumericReveal q={q} />
            <p className="text-sm text-ink-3">{fr(q.numeric.caption)}</p>
          </div>
        )}
        <p className="mt-2 font-semibold text-ink">{fr(q.reveal)}</p>
        <button type="button" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Masquer l’explication' : 'En savoir plus'}
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {open && (
          <div className="mt-2 space-y-2 text-[0.95rem] leading-relaxed text-ink-2">
            <p>{fr(q.explanation)}</p>
            {q.caveat && <p className="text-sm text-amber-200/90">⚠︎ {fr(q.caveat)}</p>}
            <p className="text-xs text-ink-3">
              Source :{' '}
              {sources.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ' · '}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2">
                    {s.publisher}
                  </a>
                </span>
              ))}{' '}
              — {fr(q.period)}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
        <Briefcase className="mt-0.5 shrink-0 text-emerald-300" size={18} aria-hidden="true" />
        <p className="text-[0.95rem] leading-relaxed text-ink">
          <span className="font-semibold text-emerald-300">Pour le manager : </span>
          {fr(q.managementInsight)}
        </p>
      </div>
    </div>
  );
}

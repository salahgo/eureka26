import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import type { QuestionStats } from '../../lib/aggregate';
import { formatPct, fr } from '../../lib/format';
import { usePrefersReducedMotion } from '../common/hooks';
import { NumericFigure } from './parts';

/** Dramatic full-screen REVEAL: countdown, then the verified figure and the correct answer. */
export default function RevealOverlay({ stats, nonce, onClose }: { stats: QuestionStats; nonce: number; onClose: () => void }) {
  const q = QUESTION_BY_ID[stats.questionId];
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? 0 : 3);
  useEffect(() => {
    setCount(reduced ? 0 : 3);
  }, [nonce, stats.questionId, reduced]);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-void/95 p-[4vw] backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Révélation de la réponse" data-testid="reveal-overlay">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[140px]" aria-hidden="true" />
      <div className="cyber-grid opacity-60" aria-hidden="true" />
      <button type="button" className="btn btn-ghost absolute right-6 top-6 z-10" onClick={onClose} aria-label="Fermer la révélation">
        <X size={22} />
      </button>
      <div className="relative w-full max-w-[110rem] text-center">
        <p className="mx-auto max-w-[80rem] text-[clamp(1.1rem,1.8vw,2.4rem)] font-medium leading-snug text-ink-2">{fr(q.question)}</p>
        {count > 0 ? (
          <div key={count} className="pop mt-[6vh] font-display text-[clamp(8rem,22vw,30rem)] font-bold leading-none text-cyan-300 glow-text" aria-live="assertive" data-testid="reveal-countdown">
            {count}
          </div>
        ) : (
          <div className="rise" data-testid="reveal-answer">
            <div className="mt-[3vh] text-[clamp(0.9rem,1.2vw,1.6rem)] font-semibold uppercase tracking-[0.35em] text-cyan-300">REVEAL</div>
            {q.numeric ? (
              <NumericFigure
                n={q.numeric}
                trigger={`${nonce}-${q.id}`}
                className="mt-[2vh] block font-display text-[clamp(5rem,16vw,24rem)] font-bold leading-[0.9] tracking-tighter text-ink glow-text"
              />
            ) : (
              <div className="mt-[3vh] font-display text-[clamp(3rem,7vw,9rem)] font-bold leading-[1] tracking-tight text-ink glow-text">{LETTERS[q.correct]}</div>
            )}
            <p className="mt-[2.5vh] inline-flex items-center gap-3 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-6 py-2 text-[clamp(1.1rem,1.6vw,2.2rem)] font-semibold text-emerald-200">
              <Check size={28} aria-hidden="true" /> {LETTERS[q.correct]}. {fr(q.choices[q.correct])}
            </p>
            {stats.respondents > 0 && (
              <p className="mt-[2.5vh] text-[clamp(1rem,1.4vw,1.9rem)] text-ink-2" data-testid="reveal-room">
                La salle : <strong className="text-ink">{formatPct(stats.pctCorrect)}</strong> juste
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

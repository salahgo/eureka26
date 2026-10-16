import { Check, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import type { NumericReveal } from '../../data/types';
import type { QuestionStats } from '../../lib/aggregate';
import { formatNumber, formatPct, fr } from '../../lib/format';
import { useCountUp } from '../common/hooks';

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix,
  suffix,
  trigger,
  duration = 1800,
  className = '',
  suffixClassName = 'text-[0.45em] text-ink-2',
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  trigger?: unknown;
  duration?: number;
  className?: string;
  suffixClassName?: string;
}) {
  const v = useCountUp(value, { duration, trigger });
  return (
    <span className={className} data-value={value}>
      {prefix}
      {formatNumber(v, decimals)}
      {suffix && <span className={suffixClassName}>{fr(suffix)}</span>}
    </span>
  );
}

export function NumericFigure({ n, trigger, className = '' }: { n: NumericReveal; trigger?: unknown; className?: string }) {
  return <AnimatedNumber value={n.value} decimals={n.decimals} prefix={n.prefix} suffix={n.suffix} trigger={trigger} className={className} />;
}

export function Kpi({ label, value, hint, accent = false, testId }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean; testId?: string }) {
  return (
    <div className={`glass rounded-2xl p-[1.1rem] ${accent ? '!border-cyan-400/40' : ''}`} data-testid={testId}>
      <div className="text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</div>
      <div className="mt-1 font-display text-[2.9rem] font-bold leading-none tracking-tight text-ink">{value}</div>
      {hint && <div className="mt-2 text-[0.9rem] text-ink-2">{hint}</div>}
    </div>
  );
}

/**
 * Horizontal vote bars for one question. Before the reveal every bar has the series colour;
 * after the reveal the correct answer is emphasised (status green + icon + label) and the others recede.
 * Manual votes are a second segment separated by a 2px surface gap and named in a legend.
 */
export function AnswerBars({ stats, revealed, compact = false }: { stats: QuestionStats; revealed: boolean; compact?: boolean }) {
  const q = QUESTION_BY_ID[stats.questionId];
  const max = Math.max(1, ...stats.total);
  const hasManual = stats.manual.some((n) => n > 0);
  return (
    <div>
      <ul className={`grid ${compact ? 'gap-[0.7rem]' : 'gap-[1.05rem]'}`} data-testid="answer-bars">
        {q.choices.map((choice, i) => {
          const correct = i === q.correct;
          const total = stats.total[i];
          const pct = stats.respondents ? total / stats.respondents : 0;
          const wCollected = (stats.collected[i] / max) * 100;
          const wManual = (stats.manual[i] / max) * 100;
          const emph = revealed && correct;
          const dim = revealed && !correct;
          const colCollected = revealed ? (correct ? 'var(--color-good)' : 'var(--color-muted-bar)') : 'var(--color-series-1)';
          const colManual = revealed ? (correct ? 'rgb(16 185 129 / 0.5)' : 'rgb(51 65 85 / 0.55)') : 'var(--color-series-2)';
          return (
            <li
              key={i}
              data-testid={`bar-${LETTERS[i]}`}
              data-correct={correct && revealed ? 'true' : undefined}
              data-votes={total}
              className={`rounded-2xl border px-[1rem] py-[0.75rem] transition-all duration-500 ${
                emph ? 'border-emerald-400/70 bg-emerald-400/[0.09] shadow-[0_0_0_1px_rgb(16_185_129/0.4),0_20px_60px_-25px_rgb(16_185_129/0.6)]' : 'border-edge bg-panel/60'
              } ${dim ? 'opacity-55' : ''}`}
              title={`${LETTERS[i]} — ${total} vote(s) dont ${stats.manual[i]} manuel(s)`}
            >
              <div className="flex items-center gap-[0.9rem]">
                <span
                  className={`flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl font-display text-[1.3rem] font-bold ${
                    emph ? 'bg-emerald-400 text-void' : 'bg-slate-800 text-ink-2'
                  }`}
                >
                  {emph ? <Check size={22} aria-label="Bonne réponse" /> : LETTERS[i]}
                </span>
                <span className={`flex-1 ${compact ? 'text-[1.1rem]' : 'text-[1.35rem]'} font-medium leading-snug`}>{fr(choice)}</span>
                {emph && <span className="sr-only">Bonne réponse</span>}
                <span className="w-[6.5rem] shrink-0 text-right font-display tabular-nums">
                  <span className="text-[1.5rem] font-bold">{formatPct(stats.respondents ? pct : null)}</span>
                  <span className="block text-[0.85rem] text-ink-3">{total} vote{total > 1 ? 's' : ''}</span>
                </span>
              </div>
              <div className="mt-[0.55rem] flex h-[1.05rem] items-stretch gap-[2px]" aria-hidden="true">
                {wCollected > 0 && (
                  <span className="rounded-l-[2px] transition-all duration-700 ease-out last:rounded-r-[4px]" style={{ width: `${wCollected}%`, background: colCollected }} />
                )}
                {wManual > 0 && (
                  <span className="rounded-r-[4px] transition-all duration-700 ease-out first:rounded-l-[2px]" style={{ width: `${wManual}%`, background: colManual }} />
                )}
                {total === 0 && <span className="w-full rounded-[2px] bg-slate-800/40" />}
              </div>
            </li>
          );
        })}
      </ul>
      {hasManual && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.9rem] text-ink-2" data-testid="bars-legend">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-5 rounded-sm" style={{ background: revealed ? 'var(--color-good)' : 'var(--color-series-1)' }} /> Réponses collectées
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-5 rounded-sm" style={{ background: revealed ? 'rgb(16 185 129 / 0.5)' : 'var(--color-series-2)' }} /> Votes collectés manuellement
          </span>
        </div>
      )}
    </div>
  );
}

export function VotesTable({ stats }: { stats: QuestionStats }) {
  const q = QUESTION_BY_ID[stats.questionId];
  return (
    <table className="mt-4 w-full text-left text-[0.95rem]" data-testid="votes-table">
      <caption className="sr-only">Votes par réponse</caption>
      <thead className="text-ink-3">
        <tr>
          <th className="py-1 font-semibold">Choix</th>
          <th className="py-1 text-right font-semibold">Collectés</th>
          <th className="py-1 text-right font-semibold">Manuels</th>
          <th className="py-1 text-right font-semibold">Total</th>
          <th className="py-1 text-right font-semibold">%</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {q.choices.map((c, i) => (
          <tr key={i} className="border-t border-edge">
            <td className="py-1">
              {LETTERS[i]}. {fr(c)}
            </td>
            <td className="py-1 text-right">{stats.collected[i]}</td>
            <td className="py-1 text-right">{stats.manual[i]}</td>
            <td className="py-1 text-right">{stats.total[i]}</td>
            <td className="py-1 text-right">{formatPct(stats.respondents ? stats.total[i] / stats.respondents : null)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function HiddenAnswer() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.03] p-8 text-center" aria-label="Réponse masquée">
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-pulse-ring" aria-hidden="true" />
        <span className="relative flex h-[6rem] w-[6rem] items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
          <Lock size={44} aria-hidden="true" />
        </span>
      </div>
      <span className="kbd mt-6 !text-[1rem]">Espace</span>
    </div>
  );
}

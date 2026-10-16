import { Briefcase, Users } from 'lucide-react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { getSource } from '../../data/sources';
import { GLOSSARY } from '../../data/glossary';
import type { QuestionStats } from '../../lib/aggregate';
import { formatPct, fr } from '../../lib/format';
import { CategoryChip } from '../common/categories';
import { AnswerBars, HiddenAnswer, NumericFigure, VotesTable } from './parts';

interface Props {
  stats: QuestionStats;
  position: number;
  total: number;
  revealed: boolean;
  explanation: boolean;
  table: boolean;
  nonce: number;
}

/** "ANCS — Agence nationale… (Tunisie)" → "ANCS" */
export const shortPublisher = (p: string) => p.split(' — ')[0].split(' (')[0];

export default function QuestionView({ stats, position, total, revealed, explanation, table, nonce }: Props) {
  const q = QUESTION_BY_ID[stats.questionId];
  const sources = q.sources.map((s) => getSource(s.id));
  return (
    <div className="grid h-full gap-[2rem] lg:grid-cols-[1.12fr_1fr]" data-testid="question-view" data-question={q.id}>
      <section className="flex min-h-0 flex-col">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChip category={q.category} size="lg" />
          <span className="chip !text-base tabular-nums">
            {position + 1} / {total}
          </span>
          <span className="chip !text-base" aria-label={`${stats.respondents} répondants`}>
            <Users size={16} aria-hidden="true" /> {stats.respondents}
          </span>
          {revealed && stats.respondents > 0 && (
            <span className="chip !border-emerald-400/40 !text-base !text-emerald-200" data-testid="pct-correct">
              {formatPct(stats.pctCorrect)} juste
            </span>
          )}
        </div>
        <h2 className="mt-[1.3rem] font-display text-[2.6rem] font-bold leading-[1.1] tracking-tight" data-testid="results-question-title">
          {fr(q.question)}
        </h2>
        <div className="mt-[1.6rem]">
          <AnswerBars stats={stats} revealed={revealed} />
          {table && <VotesTable stats={stats} />}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-[1rem]" aria-live="polite">
        {!revealed ? (
          <HiddenAnswer />
        ) : (
          <>
            <div key={`reveal-${nonce}`} className="glass rise relative flex min-h-0 flex-1 flex-col justify-center overflow-y-auto rounded-3xl p-[2rem] scrollbar-thin" data-testid="reveal-panel">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
              {q.numeric ? (
                <NumericFigure n={q.numeric} trigger={nonce} className="block font-display text-[8rem] font-bold leading-none tracking-tight text-ink glow-text" />
              ) : (
                <p className="font-display text-[2.8rem] font-bold leading-tight">
                  <span className="text-emerald-300">{LETTERS[q.correct]}.</span> {fr(q.choices[q.correct])}
                </p>
              )}
              <p className="mt-5 flex flex-wrap items-center gap-2 text-[1.05rem] text-ink-3" data-testid="source-line">
                {q.tag && <span className="chip !border-amber-400/40 !text-amber-200">{q.tag}</span>}
                <span>
                  {sources.map((s) => shortPublisher(s.publisher)).join(' · ')} · {fr(q.period.split(' (')[0])}
                </span>
              </p>
              {explanation && (
                <div className="rise mt-4 space-y-3 border-t border-edge pt-4 text-[1.1rem] leading-relaxed text-ink-2" data-testid="explanation">
                  <p>{fr(q.explanation)}</p>
                  {q.caveat && <p className="text-[1rem] text-amber-200/95">{fr(q.caveat)}</p>}
                  {q.horizon && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <p className="rounded-xl bg-cyan-400/[0.07] p-3 text-[0.98rem]">{fr(q.horizon.now)}</p>
                      <p className="rounded-xl bg-violet-400/[0.08] p-3 text-[0.98rem]">{fr(q.horizon.projection)}</p>
                    </div>
                  )}
                  <p className="flex flex-wrap gap-2">
                    {q.abbreviations.map((a) => (
                      <span key={a} className="chip !text-[0.85rem]">
                        <strong className="text-ink">{GLOSSARY[a].term}</strong> {GLOSSARY[a].expansion}
                      </span>
                    ))}
                  </p>
                  <p className="flex gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-[1.15rem] font-medium text-ink" data-testid="insight">
                    <Briefcase className="mt-1 shrink-0 text-emerald-300" size={22} aria-hidden="true" />
                    {fr(q.managementInsight)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

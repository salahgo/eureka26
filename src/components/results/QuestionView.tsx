import { Briefcase, Info, TriangleAlert, Users } from 'lucide-react';
import { QUESTION_BY_ID } from '../../data/questions';
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

export default function QuestionView({ stats, position, total, revealed, explanation, table, nonce }: Props) {
  const q = QUESTION_BY_ID[stats.questionId];
  const sources = q.sources.map((s) => ({ ...getSource(s.id), locator: s.locator }));
  return (
    <div className="grid h-full gap-[2rem] lg:grid-cols-[1.12fr_1fr]" data-testid="question-view" data-question={q.id}>
      <section className="flex min-h-0 flex-col">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChip category={q.category} size="lg" />
          <span className="chip !text-base">
            Question {position + 1} / {total}
          </span>
          <span className="chip !text-base">
            <Users size={16} aria-hidden="true" /> {stats.respondents} répondant{stats.respondents > 1 ? 's' : ''}
          </span>
          {revealed && stats.respondents > 0 && (
            <span className="chip !border-emerald-400/40 !text-base !text-emerald-200" data-testid="pct-correct">
              {formatPct(stats.pctCorrect)} de bonnes réponses
            </span>
          )}
        </div>
        <h2 className="mt-[1.3rem] font-display text-[2.45rem] font-bold leading-[1.12] tracking-tight" data-testid="results-question-title">
          {fr(q.question)}
        </h2>
        <div className="mt-[1.6rem]">
          <AnswerBars stats={stats} revealed={revealed} />
          {stats.respondents === 0 && (
            <p className="mt-3 text-[1rem] text-ink-3" data-testid="no-votes">
              Aucun vote collecté pour cette question pour l’instant — la bonne réponse et l’explication restent disponibles.
            </p>
          )}
          {table && <VotesTable stats={stats} />}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-[1rem]" aria-live="polite">
        {!revealed ? (
          <HiddenAnswer />
        ) : (
          <>
            <div key={`reveal-${nonce}`} className="glass rise relative overflow-hidden rounded-3xl p-[1.6rem]" data-testid="reveal-panel">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{q.numeric ? 'Le vrai chiffre' : 'La bonne réponse'}</span>
                <span className="text-[0.9rem] text-ink-3">{fr(q.period)}</span>
              </div>
              {q.numeric ? (
                <>
                  <NumericFigure n={q.numeric} trigger={nonce} className="mt-2 block font-display text-[5.2rem] font-bold leading-none tracking-tight text-ink glow-text" />
                  <p className="mt-2 text-[1.05rem] text-ink-2">{fr(q.numeric.caption)}</p>
                </>
              ) : null}
              <p className={`${q.numeric ? 'mt-3 text-[1.5rem]' : 'mt-3 text-[2rem]'} font-display font-semibold leading-snug`}>{fr(q.reveal)}</p>
              {explanation && (
                <div className="rise mt-4 space-y-3 border-t border-edge pt-4 text-[1.1rem] leading-relaxed text-ink-2" data-testid="explanation">
                  <p>{fr(q.explanation)}</p>
                  {q.horizon && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <p className="rounded-xl bg-cyan-400/[0.07] p-3 text-[0.98rem]">{fr(q.horizon.now)}</p>
                      <p className="rounded-xl bg-violet-400/[0.08] p-3 text-[0.98rem]">{fr(q.horizon.projection)}</p>
                    </div>
                  )}
                  <p className="flex flex-wrap gap-2">
                    {q.abbreviations.map((a) => (
                      <span key={a} className="chip !text-[0.85rem]" title={GLOSSARY[a].definition}>
                        <strong className="text-ink">{GLOSSARY[a].term}</strong> {GLOSSARY[a].expansion}
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {q.caveat && (
                <p className="mt-3 flex gap-2 text-[0.98rem] text-amber-200/95">
                  <TriangleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" /> {fr(q.caveat)}
                </p>
              )}
            </div>
            <div className="rise flex gap-3 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.07] p-[1.3rem]" style={{ animationDelay: '250ms' }} data-testid="insight">
              <Briefcase className="mt-1 shrink-0 text-emerald-300" size={26} aria-hidden="true" />
              <p className="text-[1.3rem] font-medium leading-snug text-ink">
                <span className="mr-1 font-display font-bold text-emerald-300">Pour le manager —</span>
                {fr(q.managementInsight)}
              </p>
            </div>
            <p className="flex gap-2 text-[0.92rem] leading-snug text-ink-3" data-testid="source-line">
              <Info className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
              <span>
                Source{sources.length > 1 ? 's' : ''} :{' '}
                {sources.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && ' · '}
                    <span className="text-ink-2">{s.publisher}</span> — {fr(s.title)}
                    {s.date !== '—' && ` (${s.date})`}
                  </span>
                ))}
                {!explanation && <span className="ml-2 text-ink-3/80">· Explication : touche E</span>}
              </span>
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

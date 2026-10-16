import { Flame, Target } from 'lucide-react';
import { FACTS, HEADLINE_FACT_ID } from '../../data/facts';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { getSource } from '../../data/sources';
import type { Overview, QuestionStats } from '../../lib/aggregate';
import { formatPct, fr } from '../../lib/format';
import QrCode from '../common/QrCode';
import { AnimatedNumber, Kpi, NumericFigure } from './parts';

interface Props {
  ov: Overview;
  perQuestion: QuestionStats[];
  inviteUrl: string;
  nonce: number;
  table: boolean;
}

const cardTitle = 'flex items-center gap-2 text-[0.95rem] font-semibold uppercase tracking-[0.14em]';

export default function OverviewView({ ov, perQuestion, inviteUrl, nonce, table }: Props) {
  const empty = ov.submissions === 0 && ov.totalVotes === 0;
  if (empty) return <EmptyOverview inviteUrl={inviteUrl} />;
  const hard = ov.hardest ? QUESTION_BY_ID[ov.hardest.questionId] : null;
  const surprising = ov.mostSurprising ? QUESTION_BY_ID[ov.mostSurprising.questionId] : null;
  return (
    <div className="flex h-full flex-col gap-[1.3rem]" data-testid="overview-view">
      <div className="grid grid-cols-2 gap-[1rem] md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Participants" value={<AnimatedNumber value={ov.submissions} trigger={nonce} />} accent testId="kpi-submissions" />
        <Kpi label="Complets" value={<AnimatedNumber value={ov.completed} trigger={nonce} />} testId="kpi-completed" />
        <Kpi label="Score moyen" value={ov.averageScore === null ? '—' : <AnimatedNumber value={ov.averageScore * 100} suffix=" %" trigger={nonce} />} testId="kpi-average" />
        <Kpi label="Score médian" value={ov.medianScore === null ? '—' : <AnimatedNumber value={ov.medianScore * 100} suffix=" %" trigger={nonce} />} testId="kpi-median" />
        <Kpi label="Bonnes réponses" value={ov.pctCorrect === null ? '—' : <AnimatedNumber value={ov.pctCorrect * 100} suffix=" %" trigger={nonce} />} testId="kpi-correct" />
        <Kpi label="Votes manuels" value={<AnimatedNumber value={ov.manualVotes} trigger={nonce} />} testId="kpi-manual" />
      </div>

      <div className="grid min-h-0 flex-1 gap-[1rem] lg:grid-cols-[1fr_1.25fr_1fr]">
        <div className="flex min-h-0 flex-col gap-[1rem]">
          <div className="glass flex flex-1 flex-col rounded-3xl p-[1.3rem]" data-testid="hardest">
            <div className={`${cardTitle} text-rose-300`}>
              <Target size={18} aria-hidden="true" /> La plus difficile
            </div>
            {hard && ov.hardest ? (
              <>
                <div className="mt-3 font-display text-[3.6rem] font-bold leading-none">{formatPct(ov.hardest.pctCorrect)}</div>
                <p className="mt-3 text-[1.3rem] font-medium leading-snug">{fr(hard.short)}</p>
                <p className="mt-auto pt-3 text-[1.15rem] text-emerald-300">
                  {LETTERS[hard.correct]}. {fr(hard.choices[hard.correct])}
                </p>
              </>
            ) : (
              <p className="mt-3 text-ink-3">—</p>
            )}
          </div>

          <div className="glass relative flex flex-1 flex-col overflow-hidden rounded-3xl p-[1.3rem]" data-testid="surprising">
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" aria-hidden="true" />
            <div className={`${cardTitle} text-amber-300`}>
              <Flame size={18} aria-hidden="true" /> {surprising ? 'Le plus surprenant' : 'Fait marquant'}
            </div>
            {surprising?.numeric && ov.mostSurprising ? (
              <>
                <NumericFigure n={surprising.numeric} trigger={nonce} className="mt-3 block font-display text-[3.6rem] font-bold leading-none" />
                <p className="mt-3 text-[1.3rem] font-medium leading-snug">{fr(surprising.short)}</p>
                <p className="mt-auto pt-3 text-[1.15rem] text-ink-2">
                  <strong className="text-ink">{formatPct(ov.mostSurprising.pctCorrect)}</strong> juste
                </p>
              </>
            ) : (
              <HeadlineFact nonce={nonce} />
            )}
          </div>
        </div>

        <div className="glass flex min-h-0 flex-col rounded-3xl p-[1.3rem]" data-testid="per-question">
          <div className={`${cardTitle} text-ink-3`}>Bonnes réponses par question</div>
          <ol className="mt-3 flex min-h-0 flex-1 flex-col justify-between gap-[0.2rem]">
            {perQuestion.map((st, i) => {
              const q = QUESTION_BY_ID[st.questionId];
              const pct = st.pctCorrect;
              return (
                <li key={st.questionId} className="grid grid-cols-[1.6rem_minmax(0,14.5rem)_1fr_3.4rem] items-center gap-2 text-[0.9rem]" title={`${q.id} — ${q.question}`}>
                  <span className="text-right text-ink-3 tabular-nums">{i + 1}</span>
                  <span className="truncate text-ink-2">{fr(q.short)}</span>
                  <span className="h-[0.7rem] rounded-r-[4px] bg-slate-800/50" aria-hidden="true">
                    <span className="block h-full rounded-r-[4px] bg-[var(--color-series-1)] transition-all duration-1000" style={{ width: `${pct === null ? 0 : Math.max(1, pct * 100)}%` }} />
                  </span>
                  <span className="text-right font-semibold tabular-nums text-ink">{formatPct(pct)}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="glass flex flex-col rounded-3xl p-[1.3rem]" data-testid="histogram">
          <div className={`${cardTitle} text-ink-3`}>Scores des participants</div>
          <Histogram buckets={ov.scoreHistogram} />
          {table && (
            <table className="mt-2 w-full text-[0.85rem] tabular-nums">
              <tbody>
                {ov.scoreHistogram.map((n, i) => (
                  <tr key={i} className="border-t border-edge">
                    <td>{i === 10 ? '100 %' : `${i * 10}–${i * 10 + 9} %`}</td>
                    <td className="text-right">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function HeadlineFact({ nonce }: { nonce: number }) {
  const f = FACTS.find((x) => x.id === HEADLINE_FACT_ID)!;
  return (
    <>
      <AnimatedNumber value={f.value} prefix={f.prefix} suffix={f.suffix} decimals={f.decimals} trigger={nonce} className="mt-3 block font-display text-[3.6rem] font-bold leading-none" />
      <p className="mt-3 text-[1.3rem] font-medium">{fr(f.unit)}</p>
      <p className="mt-auto pt-3 text-[0.95rem] text-ink-3">{getSource(f.sourceId).publisher.split(' — ')[0]} · {f.period}</p>
    </>
  );
}

function Histogram({ buckets }: { buckets: number[] }) {
  const max = Math.max(1, ...buckets);
  const h = 180;
  const w = 330;
  const band = w / buckets.length;
  const bar = Math.min(22, band - 6);
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <svg viewBox={`0 0 ${w + 30} ${h + 30}`} className="mt-3 w-full flex-1" role="img" aria-label="Histogramme des scores des participants">
      {ticks.map((t) => {
        const y = h - (t / max) * (h - 10);
        return (
          <g key={t}>
            <line x1={26} x2={w + 30} y1={y} y2={y} stroke="rgb(148 163 184 / 0.14)" strokeWidth={1} />
            <text x={20} y={y + 4} textAnchor="end" fontSize={11} fill="#74839b" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {t}
            </text>
          </g>
        );
      })}
      {buckets.map((n, i) => {
        const bh = (n / max) * (h - 10);
        const x = 30 + i * band + (band - bar) / 2;
        return (
          <g key={i}>
            <title>{`${i === 10 ? '100 %' : `${i * 10}–${i * 10 + 9} %`} : ${n} participant(s)`}</title>
            {n > 0 && <path d={`M${x} ${h} V${h - bh + 4} q0 -4 4 -4 h${bar - 8} q4 0 4 4 V${h} Z`} fill="var(--color-series-1)" />}
            {i % 2 === 0 && (
              <text x={x + bar / 2} y={h + 18} textAnchor="middle" fontSize={11} fill="#74839b">
                {i * 10}%
              </text>
            )}
          </g>
        );
      })}
      <line x1={26} x2={w + 30} y1={h} y2={h} stroke="rgb(148 163 184 / 0.3)" strokeWidth={1} />
    </svg>
  );
}

function EmptyOverview({ inviteUrl }: { inviteUrl: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center" data-testid="empty-state">
      <h2 className="font-display text-[3rem] font-bold tracking-tight">En attente des réponses</h2>
      <div className="mt-[4vh] rounded-3xl bg-white p-4 shadow-[0_20px_80px_-20px_rgb(34_211_238/0.6)]">
        <QrCode value={inviteUrl} size="min(26rem, 52vh)" ecc="Q" label="QR code vers le questionnaire" />
      </div>
      <p className="mt-4 font-mono text-[1.4rem] text-ink">{inviteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
    </div>
  );
}

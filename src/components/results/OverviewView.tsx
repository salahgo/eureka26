import { Camera, ClipboardPaste, Flame, ScanLine, Send, Smartphone, Target } from 'lucide-react';
import { FACTS, HEADLINE_FACT_ID } from '../../data/facts';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { getSource } from '../../data/sources';
import type { Overview, QuestionStats } from '../../lib/aggregate';
import { formatNumber, formatPct, fr } from '../../lib/format';
import QrCode from '../common/QrCode';
import { AnimatedNumber, Kpi, NumericFigure } from './parts';

interface Props {
  ov: Overview;
  perQuestion: QuestionStats[];
  sequenceLength: number;
  inviteUrl: string;
  nonce: number;
  table: boolean;
}

export default function OverviewView({ ov, perQuestion, sequenceLength, inviteUrl, nonce, table }: Props) {
  const empty = ov.submissions === 0 && ov.totalVotes === 0;
  if (empty) return <EmptyOverview inviteUrl={inviteUrl} />;
  const hard = ov.hardest ? QUESTION_BY_ID[ov.hardest.questionId] : null;
  const surprising = ov.mostSurprising ? QUESTION_BY_ID[ov.mostSurprising.questionId] : null;
  return (
    <div className="flex h-full flex-col gap-[1.3rem]" data-testid="overview-view">
      <div className="grid grid-cols-2 gap-[1rem] md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Réponses collectées" value={<AnimatedNumber value={ov.submissions} trigger={nonce} />} hint="participants (QR / import)" accent testId="kpi-submissions" />
        <Kpi label="Questionnaires complets" value={<AnimatedNumber value={ov.completed} trigger={nonce} />} hint={ov.submissions ? `${formatPct(ov.completed / ov.submissions)} des participants` : '—'} testId="kpi-completed" />
        <Kpi
          label="Score moyen"
          value={ov.averageScore === null ? '—' : <AnimatedNumber value={ov.averageScore * 100} suffix=" %" trigger={nonce} />}
          hint={ov.averageCorrect === null ? 'participants uniquement' : `${formatNumber(ov.averageCorrect, 1)} bonnes réponses en moyenne`}
          testId="kpi-average"
        />
        <Kpi label="Score médian" value={ov.medianScore === null ? '—' : <AnimatedNumber value={ov.medianScore * 100} suffix=" %" trigger={nonce} />} hint="la moitié de la salle fait mieux ou autant" testId="kpi-median" />
        <Kpi
          label="Bonnes réponses"
          value={ov.pctCorrect === null ? '—' : <AnimatedNumber value={ov.pctCorrect * 100} suffix=" %" trigger={nonce} />}
          hint={`${formatNumber(ov.totalVotes)} votes sur ${sequenceLength} questions`}
          testId="kpi-correct"
        />
        <Kpi label="Votes manuels" value={<AnimatedNumber value={ov.manualVotes} trigger={nonce} />} hint={ov.manualVotes ? 'saisis par l’animateur' : 'aucun'} testId="kpi-manual" />
      </div>

      <div className="grid min-h-0 flex-1 gap-[1rem] lg:grid-cols-[1fr_1.25fr_1fr]">
        <div className="flex min-h-0 flex-col gap-[1rem]">
          <div className="glass flex flex-1 flex-col rounded-3xl p-[1.3rem]" data-testid="hardest">
            <div className="flex items-center gap-2 text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-rose-300">
              <Target size={18} aria-hidden="true" /> Question la plus difficile
            </div>
            {hard && ov.hardest ? (
              <>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-[3.2rem] font-bold leading-none">{formatPct(ov.hardest.pctCorrect)}</span>
                  <span className="text-[0.95rem] text-ink-3">de bonnes réponses · {ov.hardest.respondents} votes</span>
                </div>
                <p className="mt-3 text-[1.15rem] font-medium leading-snug">{fr(hard.question)}</p>
                <p className="mt-auto pt-3 text-[1.02rem] text-emerald-300">
                  Réponse : {LETTERS[hard.correct]}. {fr(hard.choices[hard.correct])}
                </p>
              </>
            ) : (
              <p className="mt-3 text-ink-3">Pas encore assez de votes.</p>
            )}
          </div>

          <div className="glass relative flex flex-1 flex-col overflow-hidden rounded-3xl p-[1.3rem]" data-testid="surprising">
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" aria-hidden="true" />
            <div className="flex items-center gap-2 text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-amber-300">
              <Flame size={18} aria-hidden="true" /> {surprising ? 'Le chiffre qui a le plus surpris la salle' : 'Fait marquant (sélection éditoriale)'}
            </div>
            {surprising?.numeric && ov.mostSurprising ? (
              <>
                <NumericFigure n={surprising.numeric} trigger={nonce} className="mt-2 block font-display text-[3.2rem] font-bold leading-none" />
                <p className="mt-2 text-[1rem] text-ink-2">{fr(surprising.numeric.caption)}</p>
                <p className="mt-auto pt-3 text-[1rem] text-ink-2">
                  Seulement <strong className="text-ink">{formatPct(ov.mostSurprising.pctCorrect)}</strong> de la salle avait vu juste.
                </p>
              </>
            ) : (
              <HeadlineFact nonce={nonce} />
            )}
          </div>
        </div>

        <div className="glass flex min-h-0 flex-col rounded-3xl p-[1.3rem]" data-testid="per-question">
          <div className="text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-ink-3">Bonnes réponses par question</div>
          <p className="text-[0.9rem] text-ink-3">Part des votes corrects (participants + votes manuels)</p>
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

        <div className="glass flex flex-col rounded-3xl p-[1.4rem]" data-testid="histogram">
          <div className="text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-ink-3">Distribution des scores</div>
          <p className="text-[0.9rem] text-ink-3">Nombre de participants par taux de bonnes réponses</p>
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
      <p className="mt-2 text-[1.05rem] text-ink-2">{fr(f.unit)}</p>
      <p className="mt-auto pt-4 text-[1.05rem] text-ink-2">
        {fr(f.context)} <span className="text-ink-3">— {getSource(f.sourceId).publisher}</span>
      </p>
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
  const steps = [
    { icon: Smartphone, text: 'Les participants répondent sur leur téléphone (aucune donnée envoyée).' },
    { icon: Send, text: 'À la fin, chacun affiche un QR code anonyme contenant ses réponses.' },
    { icon: Camera, text: 'L’animateur le scanne avec la caméra de cet ordinateur (/admin).' },
    { icon: ClipboardPaste, text: 'Ou importe des codes collés, des fichiers JSON, ou saisit des votes manuels.' },
  ];
  return (
    <div className="grid h-full items-center gap-[2rem] lg:grid-cols-[1.4fr_1fr]" data-testid="empty-state">
      <div>
        <p className="chip !text-base">
          <ScanLine size={16} aria-hidden="true" /> En attente des premières réponses
        </p>
        <h2 className="mt-4 font-display text-[3.4rem] font-bold leading-[1.05] tracking-tight">
          Aucune réponse du public n’a encore été collectée sur cet ordinateur.
        </h2>
        <p className="mt-4 max-w-[48rem] text-[1.3rem] leading-relaxed text-ink-2">
          {fr("Les résultats d'audience s'affichent ici dès que des réponses sont scannées ou importées. En attendant, les bonnes réponses, les explications et les chiffres sourcés restent disponibles : touche 2 pour les questions, 3 pour les chiffres chocs.")}
        </p>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={i} className="glass flex items-start gap-3 rounded-2xl p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <s.icon size={20} aria-hidden="true" />
              </span>
              <span className="text-[1.05rem] leading-snug text-ink-2">{fr(s.text)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col items-center">
        <div className="rounded-3xl bg-white p-4 shadow-[0_20px_80px_-20px_rgb(34_211_238/0.6)]">
          <QrCode value={inviteUrl} size="min(24rem, 42vh)" ecc="Q" label="QR code vers le questionnaire" />
        </div>
        <p className="mt-3 font-mono text-[1.2rem] text-ink">{inviteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
      </div>
    </div>
  );
}

import { Bot, Building2, Fingerprint, Gauge, KeyRound, Landmark, Layers, Network, Radar, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { TopicStats } from '../../lib/aggregate';
import type { ManagementTopic } from '../../data/types';
import { formatPct } from '../../lib/format';

const TOPIC_ICONS: Record<ManagementTopic, LucideIcon> = {
  'Gouvernance cyber': Building2,
  GRC: Layers,
  'NIST CSF': Landmark,
  'RTO/RPO': Gauge,
  'SOC/SIEM/SOAR': Radar,
  'IAM/PAM': KeyRound,
  'Supervision des agents IA': Bot,
  'Zero Trust': ShieldCheck,
  'Souveraineté numérique': Fingerprint,
  'Post-quantique': Network,
};

export default function ManagementView({ topics }: { topics: TopicStats[]; hasData?: boolean }) {
  return (
    <div className="flex h-full flex-col" data-testid="management-view">
      <h2 className="mb-[1.1rem] font-display text-[2.3rem] font-bold tracking-tight">Management cyber</h2>
      <div className="grid flex-1 grid-cols-1 gap-[0.9rem] sm:grid-cols-2 xl:grid-cols-5">
        {topics.map((t, i) => {
          const Icon = TOPIC_ICONS[t.topic];
          const pct = t.pctCorrect;
          return (
            <div key={t.topic} className="glass rise flex flex-col justify-between rounded-2xl p-[1.2rem]" style={{ animationDelay: `${i * 50}ms` }} data-testid={`topic-${t.topic}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/12 text-cyan-200">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="font-display text-[1.35rem] font-bold leading-tight">{t.topic}</span>
              </div>
              <div>
                <span className="font-display text-[4rem] font-bold leading-none tracking-tight">{pct === null ? '—' : formatPct(pct)}</span>
                <div className="mt-3 h-[0.9rem] rounded-full bg-cyan-950/80" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct === null ? undefined : Math.round(pct * 100)} aria-label={`${t.topic} : ${pct === null ? 'pas de données' : formatPct(pct)}`}>
                  <div className="h-full rounded-full bg-[var(--color-series-1)] transition-all duration-1000 ease-out" style={{ width: `${pct === null ? 0 : Math.max(2, pct * 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

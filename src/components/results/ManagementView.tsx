import { Bot, Building2, Fingerprint, Gauge, KeyRound, Landmark, Layers, Network, Radar, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { TopicStats } from '../../lib/aggregate';
import type { ManagementTopic } from '../../data/types';
import { formatPct, fr } from '../../lib/format';

const TOPIC_INFO: Record<ManagementTopic, { icon: LucideIcon; text: string }> = {
  'Gouvernance cyber': { icon: Building2, text: 'La direction arbitre le risque accepté ; le RSSI pilote ; les métiers décident.' },
  GRC: { icon: Layers, text: 'Gouvernance, gestion des risques et conformité reliées à la stratégie.' },
  'NIST CSF': { icon: Landmark, text: 'Govern, Identify, Protect, Detect, Respond, Recover.' },
  'RTO/RPO': { icon: Gauge, text: 'Délai de reprise visé et perte de données tolérée, fixés par les métiers.' },
  'SOC/SIEM/SOAR': { icon: Radar, text: 'Surveiller, corréler, automatiser la réponse aux incidents.' },
  'IAM/PAM': { icon: KeyRound, text: 'Identités, droits et comptes à privilèges sous contrôle.' },
  'Supervision des agents IA': { icon: Bot, text: 'Identité, moindre privilège, traçabilité et responsable humain.' },
  'Zero Trust': { icon: ShieldCheck, text: 'Aucune confiance implicite : vérifier chaque accès.' },
  'Souveraineté numérique': { icon: Fingerprint, text: 'Maîtriser données, clés, outils et décisions.' },
  'Post-quantique': { icon: Network, text: 'Inventaire cryptographique et migration ML-KEM / ML-DSA.' },
};

export default function ManagementView({ topics, hasData }: { topics: TopicStats[]; hasData: boolean }) {
  return (
    <div className="flex h-full flex-col" data-testid="management-view">
      <div className="mb-[1.1rem] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[2.3rem] font-bold tracking-tight">Ce que la salle sait du management cyber</h2>
          <p className="text-[1.05rem] text-ink-2">Taux de bonnes réponses par thème, calculé sur les questions de concepts (abréviations, gouvernance, IA, futur).</p>
        </div>
        {!hasData && <span className="chip !text-base">Aucune réponse collectée : les jauges se rempliront avec les votes</span>}
      </div>
      <div className="grid flex-1 grid-cols-1 gap-[0.9rem] sm:grid-cols-2 xl:grid-cols-5">
        {topics.map((t, i) => {
          const info = TOPIC_INFO[t.topic];
          const pct = t.pctCorrect;
          return (
            <div key={t.topic} className="glass rise flex flex-col rounded-2xl p-[1.1rem]" style={{ animationDelay: `${i * 50}ms` }} data-testid={`topic-${t.topic}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/12 text-cyan-200">
                  <info.icon size={20} aria-hidden="true" />
                </span>
                <span className="font-display text-[1.25rem] font-bold leading-tight">{t.topic}</span>
              </div>
              <p className="mt-3 flex-1 text-[1.02rem] leading-snug text-ink-2">{fr(info.text)}</p>
              <div className="mt-3">
                <div className="flex items-end justify-between gap-2">
                  <span className="font-display text-[3.4rem] font-bold leading-none tracking-tight">{pct === null ? '—' : formatPct(pct)}</span>
                  <span className="pb-1 text-right text-[0.85rem] leading-tight text-ink-3">
                    {t.questionIds.length === 0 ? 'hors sélection' : <>bonnes réponses<br />{t.respondents} vote{t.respondents > 1 ? 's' : ''}</>}
                  </span>
                </div>
                <div className="mt-3 h-[0.9rem] rounded-full bg-cyan-950/80" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct === null ? undefined : Math.round(pct * 100)} aria-label={`${t.topic} : ${pct === null ? 'pas de données' : formatPct(pct)}`}>
                  <div className="h-full rounded-full bg-[var(--color-series-1)] transition-all duration-1000 ease-out" style={{ width: `${pct === null ? 0 : Math.max(2, pct * 100)}%` }} />
                </div>
                <p className="mt-2 text-[0.8rem] text-ink-3">{t.questionIds.length ? `Questions : ${t.questionIds.join(', ')}` : 'Activez une question de ce thème dans /admin'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { ArrowRight, Atom, Bot, Briefcase, Fingerprint, GraduationCap, Landmark, LifeBuoy, Scale, ShieldCheck, Sparkles, Wrench, type LucideIcon } from 'lucide-react';
import { fr } from '../../lib/format';

const STAGES: { title: string; icon: LucideIcon; tone: string; text: string }[] = [
  { title: 'Management traditionnel', icon: Briefcase, tone: 'border-slate-500/40', text: 'text-slate-300' },
  { title: 'Management cyber-conscient', icon: ShieldCheck, tone: 'border-cyan-400/50', text: 'text-cyan-300' },
  { title: 'Management IA-conscient, sécurisé et résilient', icon: Sparkles, tone: 'border-violet-400/60', text: 'text-violet-300' },
];

const PILLARS: { label: string; icon: LucideIcon }[] = [
  { label: 'Sécurité dès la conception', icon: Wrench },
  { label: 'Gouvernance des risques', icon: Scale },
  { label: 'Supervision humaine des agents IA', icon: Bot },
  { label: 'Souveraineté numérique', icon: Fingerprint },
  { label: 'Zero Trust', icon: ShieldCheck },
  { label: 'Continuité d’activité', icon: LifeBuoy },
  { label: 'Préparation post-quantique', icon: Atom },
  { label: 'Culture cybersécurité', icon: GraduationCap },
  { label: 'Responsabilité du conseil', icon: Landmark },
];

/** Educational framework (not a forecast): three stages and nine pillars. */
export default function FutureView() {
  return (
    <div className="flex h-full flex-col" data-testid="future-view">
      <div className="mb-[1.2rem] flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-[2.5rem] font-bold tracking-tight">Le management de demain</h2>
        <span className="chip !border-amber-400/40 !text-[0.95rem] !text-amber-200">Cadre pédagogique, pas une prévision</span>
      </div>

      <ol className="grid items-stretch gap-[1rem] lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STAGES.map((s, i) => (
          <li key={s.title} className="contents">
            <div className={`glass rise relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-3xl border-2 p-[1.6rem] ${s.tone}`} style={{ animationDelay: `${i * 220}ms` }}>
              {i === 2 && <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />}
              <div className="flex items-center justify-between">
                <s.icon size={42} className={s.text} aria-hidden="true" />
                <span className={`font-display text-[3rem] font-bold leading-none opacity-40 ${s.text}`}>{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-[2.1rem] font-bold leading-tight">{fr(s.title)}</h3>
            </div>
            {i < 2 && (
              <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                <ArrowRight size={44} className="text-cyan-300/80" />
              </div>
            )}
          </li>
        ))}
      </ol>

      <ul className="mt-[1.4rem] grid flex-1 grid-cols-1 gap-[0.8rem] sm:grid-cols-3">
        {PILLARS.map((p, i) => (
          <li key={p.label} className="glass rise flex items-center gap-4 rounded-2xl px-6 py-3 text-[1.5rem] font-semibold" style={{ animationDelay: `${700 + i * 60}ms` }}>
            <p.icon size={34} className="shrink-0 text-cyan-300" aria-hidden="true" /> {fr(p.label)}
          </li>
        ))}
      </ul>
    </div>
  );
}

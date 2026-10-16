import { ArrowRight, Atom, Bot, Fingerprint, GraduationCap, Landmark, LifeBuoy, Scale, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';
import { fr } from '../../lib/format';

const STAGES = [
  {
    title: 'Management traditionnel',
    tag: 'La cybersécurité est « un sujet informatique »',
    tone: 'border-slate-500/40',
    dot: 'bg-slate-400',
    traits: ['Budget sécurité noyé dans l’IT', 'Conformité ponctuelle', 'On réagit après l’incident', 'Les fournisseurs « s’en occupent »'],
    question: '« L’informatique a bien installé l’antivirus ? »',
  },
  {
    title: 'Management cyber-conscient',
    tag: 'Le risque cyber est un risque d’entreprise',
    tone: 'border-cyan-400/45',
    dot: 'bg-cyan-300',
    traits: ['Gouvernance des risques (GRC, NIST CSF)', 'RTO / RPO décidés par les métiers', 'Culture cybersécurité de tous', 'Le conseil d’administration rend des comptes'],
    question: '« Quel risque acceptons-nous, et qui en répond ? »',
  },
  {
    title: 'Management IA-conscient, sécurisé et résilient',
    tag: 'Humains et agents IA sous une gouvernance explicite',
    tone: 'border-violet-400/55',
    dot: 'bg-violet-300',
    traits: ['Supervision humaine des agents IA', 'Zero Trust et moindre privilège', 'Souveraineté des données et des clés', 'Préparation post-quantique'],
    question: '« Que nos agents IA peuvent-ils faire seuls — et qui les supervise ? »',
  },
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

export default function FutureView() {
  return (
    <div className="flex h-full flex-col" data-testid="future-view">
      <div className="mb-[1.2rem] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[2.5rem] font-bold tracking-tight">Le management de demain</h2>
          <p className="text-[1.1rem] text-ink-2">Une trajectoire de maturité pour 2026–2030.</p>
        </div>
        <span className="chip !border-amber-400/40 !text-[0.95rem] !text-amber-200">Cadre pédagogique — pas une prévision statistique</span>
      </div>

      <ol className="grid flex-1 items-stretch gap-[1rem] lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STAGES.map((s, i) => (
          <li key={s.title} className="contents">
            <div className={`glass rise relative flex flex-col overflow-hidden rounded-3xl border-2 p-[1.5rem] ${s.tone}`} style={{ animationDelay: `${i * 220}ms` }}>
              {i === 2 && <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />}
              <div className="flex items-center gap-2 text-[0.9rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} /> Étape {i + 1}
              </div>
              <h3 className={`mt-2 font-display font-bold leading-tight ${i === 2 ? 'text-[2.05rem]' : 'text-[1.85rem]'}`}>{fr(s.title)}</h3>
              <p className="mt-2 text-[1.1rem] italic text-ink-2">{fr(s.tag)}</p>
              <ul className="mt-4 space-y-2.5">
                {s.traits.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[1.2rem] leading-snug">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                    {fr(t)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink-3">La question du dirigeant</div>
                <p className={`mt-1 font-display text-[1.45rem] font-semibold leading-snug ${i === 2 ? 'text-violet-200' : i === 1 ? 'text-cyan-100' : 'text-ink-2'}`}>{fr(s.question)}</p>
              </div>
            </div>
            {i < 2 && (
              <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                <ArrowRight size={40} className="text-cyan-300/80" />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-[1.2rem]">
        <p className="mb-2 text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-ink-3">Les 9 piliers</p>
        <ul className="flex flex-wrap gap-[0.6rem]">
          {PILLARS.map((p, i) => (
            <li key={p.label} className="chip rise !px-4 !py-2 !text-[1.02rem] !text-ink" style={{ animationDelay: `${700 + i * 60}ms` }}>
              <p.icon size={18} className="text-cyan-300" aria-hidden="true" /> {fr(p.label)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

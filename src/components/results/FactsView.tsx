import { X } from 'lucide-react';
import { FACTS } from '../../data/facts';
import type { Fact } from '../../data/types';
import { getSource } from '../../data/sources';
import { fr } from '../../lib/format';
import { AnimatedNumber } from './parts';

const TONES: Record<Fact['tone'], { ring: string; glow: string; text: string }> = {
  cyan: { ring: 'border-cyan-400/35', glow: 'bg-cyan-400/20', text: 'text-cyan-300' },
  amber: { ring: 'border-amber-400/35', glow: 'bg-amber-400/20', text: 'text-amber-300' },
  red: { ring: 'border-rose-400/40', glow: 'bg-rose-500/20', text: 'text-rose-300' },
  violet: { ring: 'border-violet-400/40', glow: 'bg-violet-500/20', text: 'text-violet-300' },
};

interface Props {
  factIndex: number;
  spotlight: boolean;
  nonce: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function FactsView({ factIndex, spotlight, nonce, onSelect, onClose }: Props) {
  const current = FACTS[factIndex % FACTS.length];
  return (
    <div className="relative h-full" data-testid="facts-view">
      <div className="mb-[1rem] flex items-end justify-between gap-4">
        <h2 className="font-display text-[2.3rem] font-bold tracking-tight">Les chiffres chocs 2025–2026</h2>
        <p className="text-[0.95rem] text-ink-3">Statistiques externes sourcées — chaque chiffre a sa propre unité, ils ne sont pas comparés entre eux.</p>
      </div>
      <div className="grid grid-cols-1 gap-[0.9rem] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FACTS.map((f, i) => {
          const t = TONES[f.tone];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(i)}
              className={`glass rise group relative overflow-hidden rounded-2xl border p-[1.05rem] text-left transition-transform hover:-translate-y-0.5 ${t.ring} ${
                i === factIndex % FACTS.length ? 'ring-2 ring-cyan-300/70' : ''
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
              data-testid={`fact-${f.id}`}
            >
              <span className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${t.glow}`} aria-hidden="true" />
              <AnimatedNumber
                value={f.value}
                decimals={f.decimals}
                prefix={f.prefix}
                suffix={f.suffix}
                trigger={nonce}
                duration={1600 + i * 90}
                className="block font-display text-[2.6rem] font-bold leading-none tracking-tight"
              />
              <span className={`mt-1 block text-[0.85rem] font-semibold uppercase tracking-wider ${t.text}`}>{fr(f.unit)}</span>
              <span className="mt-2 block text-[1.02rem] font-semibold leading-snug">{fr(f.title)}</span>
              <span className="mt-1 block text-[0.82rem] text-ink-3">
                {getSource(f.sourceId).publisher.split(' — ')[0]} · {f.period}
              </span>
            </button>
          );
        })}
      </div>

      {spotlight && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/92 p-[4vw] backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Chiffre en plein écran" data-testid="fact-spotlight">
          <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${TONES[current.tone].glow}`} aria-hidden="true" />
          <button type="button" className="btn btn-ghost absolute right-6 top-6" onClick={onClose} aria-label="Fermer">
            <X size={22} /> <span className="kbd">Échap</span>
          </button>
          <div key={`${current.id}-${nonce}`} className="relative max-w-[90rem] text-center">
            <div className={`text-[1.2rem] font-semibold uppercase tracking-[0.25em] ${TONES[current.tone].text}`}>{current.period}</div>
            <AnimatedNumber
              value={current.value}
              decimals={current.decimals}
              prefix={current.prefix}
              suffix={current.suffix}
              trigger={`${current.id}-${nonce}`}
              duration={2200}
              className="mt-4 block font-display text-[clamp(5rem,15vw,22rem)] font-bold leading-[0.9] tracking-tighter glow-text"
            />
            <div className={`mt-4 text-[clamp(1.2rem,2vw,2.6rem)] font-semibold uppercase tracking-wider ${TONES[current.tone].text}`}>{fr(current.unit)}</div>
            <p className="mx-auto mt-6 max-w-[70rem] font-display text-[clamp(1.6rem,3vw,4rem)] font-bold leading-tight">{fr(current.title)}</p>
            <p className="mx-auto mt-4 max-w-[60rem] text-[clamp(1.1rem,1.6vw,2rem)] text-ink-2">{fr(current.context)}</p>
            <p className="mt-6 text-[clamp(0.9rem,1vw,1.3rem)] text-ink-3">
              Source : {getSource(current.sourceId).publisher} — {fr(getSource(current.sourceId).title)}
            </p>
            <p className="mt-8 text-[0.95rem] text-ink-3">
              <span className="kbd">←</span> <span className="kbd">→</span> chiffre précédent / suivant · {(factIndex % FACTS.length) + 1}/{FACTS.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { X } from 'lucide-react';
import { FACTS } from '../../data/facts';
import type { Fact } from '../../data/types';
import { getSource } from '../../data/sources';
import { fr } from '../../lib/format';
import { AnimatedNumber } from './parts';
import { shortPublisher } from './QuestionView';

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

/** Each figure is animated on its own card with its own unit — never drawn on a shared scale. */
export default function FactsView({ factIndex, spotlight, nonce, onSelect, onClose }: Props) {
  const current = FACTS[factIndex % FACTS.length];
  return (
    <div className="relative h-full" data-testid="facts-view">
      <div className="grid h-full grid-cols-1 gap-[0.9rem] sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-4 xl:grid-cols-4 xl:grid-rows-3">
        {FACTS.map((f, i) => {
          const t = TONES[f.tone];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={f.title}
              className={`glass rise group relative flex flex-col justify-center overflow-hidden rounded-2xl border p-[1.2rem] text-left transition-transform hover:-translate-y-0.5 ${t.ring} ${
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
                className="block font-display text-[4rem] font-bold leading-none tracking-tight"
              />
              <span className={`mt-3 block text-[1.2rem] font-semibold ${t.text}`}>{fr(f.unit)}</span>
              <span className="mt-1 block text-[0.85rem] text-ink-3">
                {shortPublisher(getSource(f.sourceId).publisher)} · {f.period}
              </span>
            </button>
          );
        })}
      </div>

      {spotlight && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-void/92 p-[4vw] backdrop-blur-md" role="dialog" aria-modal="true" aria-label={current.title} data-testid="fact-spotlight">
          <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${TONES[current.tone].glow}`} aria-hidden="true" />
          <button type="button" className="btn btn-ghost absolute right-6 top-6" onClick={onClose} aria-label="Fermer">
            <X size={22} />
          </button>
          <div key={`${current.id}-${nonce}`} className="relative max-w-[90rem] text-center">
            <AnimatedNumber
              value={current.value}
              decimals={current.decimals}
              prefix={current.prefix}
              suffix={current.suffix}
              trigger={`${current.id}-${nonce}`}
              duration={2200}
              className="block font-display text-[clamp(5rem,16vw,24rem)] font-bold leading-[0.9] tracking-tighter glow-text"
            />
            <div className={`mt-6 font-display text-[clamp(1.6rem,3vw,4rem)] font-bold ${TONES[current.tone].text}`}>{fr(current.unit)}</div>
            <p className="mt-6 text-[clamp(0.9rem,1.1vw,1.4rem)] text-ink-3">
              {shortPublisher(getSource(current.sourceId).publisher)} · {current.period}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tagline?: boolean;
}

const sizes = {
  sm: { icon: 26, text: 'text-lg' },
  md: { icon: 34, text: 'text-2xl' },
  lg: { icon: 48, text: 'text-4xl' },
  xl: { icon: 72, text: 'text-6xl md:text-7xl' },
};

export function ShieldMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M32 6 54 15v15c0 14-9.4 24.6-22 28-12.6-3.4-22-14-22-28V15z" fill="rgb(34 211 238 / 0.08)" stroke="url(#brand-g)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M23 23h18M23 32h13M23 41h18" stroke="#e8eef8" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ size = 'md', tagline = false }: Props) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3">
      <ShieldMark size={s.icon} />
      <div className="leading-none">
        <div className={`font-display font-bold tracking-tight ${s.text}`}>
          EUREKA<span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">26</span>
        </div>
        {tagline && <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink-3">Cybersécurité · IA · Management</div>}
      </div>
    </div>
  );
}

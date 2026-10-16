import { Maximize, Minimize, ScanLine, Send, Smartphone, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { activeSequence } from '../../lib/config';
import { fr } from '../../lib/format';
import { invitationUrl, isLocalhost } from '../../lib/urls';
import Brand from '../common/Brand';
import QrCode from '../common/QrCode';
import { useFullscreen } from '../common/hooks';
import { useConfig, useSession } from '../common/shared';

export default function InviteScreen() {
  const [config] = useConfig();
  const [session] = useSession();
  const sequence = activeSequence(config);
  const count = sequence.length || 16;
  const url = invitationUrl(sequence, config.inviteUrl, config.phoneFeedback);
  const display = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const { isFullscreen, toggle, supported } = useFullscreen();
  const local = isLocalhost(url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const steps = [
    { icon: ScanLine, title: 'Scannez', text: 'Visez le QR code avec l’appareil photo de votre téléphone.' },
    { icon: Smartphone, title: 'Répondez', text: `${count} questions express — anonyme, sans inscription.` },
    { icon: Send, title: 'Transmettez', text: 'À la fin, montrez votre QR code de réponses à l’animateur.' },
  ];

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-[clamp(1rem,3vw,4rem)] py-[clamp(1rem,2.5vh,2.5rem)]">
      <NetworkDecor />
      <header className="relative flex items-center justify-between">
        <Brand size="lg" tagline />
        {supported && (
          <button type="button" className="btn btn-ghost" onClick={toggle} aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'} data-testid="fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Quitter' : 'Plein écran'}</span>
            <span className="kbd hidden md:inline-flex">F</span>
          </button>
        )}
      </header>

      {local && (
        <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-amber-200" role="alert">
          <TriangleAlert size={18} aria-hidden="true" /> URL locale détectée : ne projetez pas ce QR code en public. Corrigez l’URL d’invitation dans l’interface animateur.
        </div>
      )}

      <section className="relative grid flex-1 items-center gap-[clamp(1.5rem,4vw,5rem)] py-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="rise">
          <p className="chip mb-[2.5vh] !border-rose-400/40 !text-rose-200 !text-[clamp(0.8rem,1vw,1.15rem)]">
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_#f43f5e]" /> Tunisie · 1er semestre 2026 · source ANCS
          </p>
          <h1 className="font-display text-[clamp(2.2rem,4.6vw,6.5rem)] font-bold leading-[1.02] tracking-tight">
            <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-blue-400 bg-clip-text text-transparent">{fr('« 35 000 cyberattaques DDoS')}</span>{' '}
            {fr('en six mois. Et vous, connaissez-vous les vrais chiffres ? »')}
          </h1>
          <p className="mt-[3vh] max-w-[46rem] text-[clamp(1.1rem,1.6vw,2.1rem)] leading-snug text-ink-2">
            {fr('« Scannez le QR code et testez vos connaissances en cybersécurité, IA et management. »')}
          </p>
          <ol className="mt-[4vh] grid gap-[clamp(0.6rem,1.2vw,1.4rem)] sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="glass rounded-2xl p-[clamp(0.9rem,1.2vw,1.6rem)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-[clamp(2.2rem,2.6vw,3.4rem)] w-[clamp(2.2rem,2.6vw,3.4rem)] items-center justify-center rounded-xl bg-cyan-400/15 font-display text-[clamp(1.1rem,1.4vw,1.8rem)] font-bold text-cyan-200">
                    {i + 1}
                  </span>
                  <s.icon className="text-cyan-300" size={26} aria-hidden="true" />
                </div>
                <div className="mt-3 font-display text-[clamp(1.15rem,1.5vw,2rem)] font-bold">{s.title}</div>
                <p className="mt-1 text-[clamp(0.95rem,1.05vw,1.35rem)] leading-snug text-ink-2">{fr(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rise flex flex-col items-center" style={{ animationDelay: '150ms' }}>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-cyan-400/20 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[2rem] bg-white p-[clamp(0.8rem,1.4vw,1.75rem)] shadow-[0_30px_120px_-20px_rgb(34_211_238/0.6)]">
              <QrCode
                value={url}
                size="min(78vw, 64vh, 46vw)"
                ecc="Q"
                label={`QR code vers le questionnaire : ${display}`}
                testId="invite-qr"
                className="block"
              />
              <div className="scanline" aria-hidden="true" />
              <Corners />
            </div>
          </div>
          <p className="mt-[3vh] text-center font-mono text-[clamp(1rem,1.7vw,2.2rem)] font-semibold tracking-tight text-ink" data-testid="invite-url">
            {display}
          </p>
          <p className="mt-1 text-center text-[clamp(0.85rem,0.95vw,1.15rem)] text-ink-3">
            {session.submissions.length > 0
              ? `${session.submissions.length} réponse(s) déjà collectée(s) sur cet ordinateur`
              : 'Aucune donnée personnelle collectée · hébergé sur GitHub Pages'}
          </p>
        </div>
      </section>
    </main>
  );
}

function Corners() {
  const c = 'absolute h-10 w-10 border-cyan-400';
  return (
    <div aria-hidden="true">
      <span className={`${c} -left-3 -top-3 rounded-tl-2xl border-l-4 border-t-4`} />
      <span className={`${c} -right-3 -top-3 rounded-tr-2xl border-r-4 border-t-4`} />
      <span className={`${c} -bottom-3 -left-3 rounded-bl-2xl border-b-4 border-l-4`} />
      <span className={`${c} -bottom-3 -right-3 rounded-br-2xl border-b-4 border-r-4`} />
    </div>
  );
}

/** Subtle animated network illustration in the background. */
export function NetworkDecor() {
  const nodes = [
    [8, 18], [22, 8], [36, 22], [18, 38], [6, 62], [30, 56], [46, 40], [60, 12], [72, 30], [88, 16], [94, 44], [80, 60], [64, 74], [44, 82], [24, 88], [90, 86],
  ];
  const links = [
    [0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [3, 5], [5, 6], [2, 6], [6, 7], [7, 8], [8, 9], [9, 10], [8, 10], [10, 11], [11, 12], [6, 12], [12, 13], [13, 14], [5, 13], [11, 15],
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="rgb(56 189 248 / 0.18)" strokeWidth="0.12" vectorEffect="non-scaling-stroke" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.35" fill={i % 5 === 0 ? 'rgb(244 63 94 / 0.7)' : 'rgb(34 211 238 / 0.7)'}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

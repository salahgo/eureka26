import { ChevronLeft, ChevronRight, Eye, EyeOff, FlaskConical, MonitorPlay, Pause, Play, Sparkles, Table } from 'lucide-react';
import { FACTS } from '../../data/facts';
import { QUESTION_BY_ID } from '../../data/questions';
import { nextState, type DashboardView, type PresentationState } from '../../lib/config';
import { fr } from '../../lib/format';

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'question', label: 'Questions' },
  { id: 'facts', label: 'Chiffres chocs' },
  { id: 'future', label: 'Futur' },
];

interface Props {
  presentation: PresentationState;
  setPresentation: (fn: (prev: PresentationState) => PresentationState) => void;
  sequence: string[];
}

export default function RemotePanel({ presentation: p, setPresentation, sequence }: Props) {
  const act = (patch: Partial<PresentationState>) => setPresentation((prev) => ({ ...prev, ...patch, nonce: prev.nonce + 1 }));
  const step = (cmd: 'next' | 'prev') => setPresentation((prev) => ({ ...prev, ...nextState(prev, cmd, sequence.length), nonce: prev.nonce + 1 }));
  const pos = Math.min(p.pos, Math.max(0, sequence.length - 1));
  const q = QUESTION_BY_ID[sequence[pos]];
  const viewLabel = VIEWS.find((v) => v.id === p.view)?.label;

  return (
    <section className="glass rounded-3xl p-5" data-testid="remote">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <MonitorPlay size={20} className="text-cyan-300" aria-hidden="true" /> Télécommande
      </h2>

      <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.06] p-4" aria-live="polite" data-testid="remote-status">
        <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">/results</div>
        <div className="mt-1 font-display text-lg font-bold">
          {viewLabel}
          {p.view === 'question' && q && ` · ${pos + 1}/${sequence.length} · ${p.revealed ? 'réponse révélée' : 'réponse masquée'}${p.explanation ? ' · explication' : ''}`}
          {p.view === 'facts' && ` · ${p.spotlight ? 'plein écran' : 'grille'} · ${(p.factIndex % FACTS.length) + 1}/${FACTS.length}`}
          {p.autoplay && ' · diaporama'}
          {p.demo && ' · MODE DÉMONSTRATION'}
        </div>
        {p.view === 'question' && q && <p className="mt-1 text-sm text-ink-2">{fr(q.question)}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`btn ${p.view === v.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => act({ view: v.id, revealMode: false, spotlight: false })}
            data-testid={`remote-view-${v.id}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" className="btn btn-ghost" onClick={() => step('prev')} data-testid="remote-prev">
          <ChevronLeft size={18} /> Précédent
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => step('next')} data-testid="remote-next">
          Suivant <ChevronRight size={18} />
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => act({ view: 'question', revealed: !p.revealed })} data-testid="remote-reveal">
          {p.revealed ? <EyeOff size={18} /> : <Eye size={18} />} {p.revealed ? 'Masquer la réponse' : 'Révéler la réponse'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => act({ explanation: !p.explanation, revealed: true })} data-testid="remote-explanation">
          {p.explanation ? 'Masquer' : 'Afficher'} l’explication
        </button>
        <button type="button" className="btn btn-primary" onClick={() => act({ view: 'question', revealMode: !p.revealMode, revealed: true })} data-testid="remote-revealmode">
          <Sparkles size={18} /> {p.revealMode ? 'Fermer REVEAL' : 'REVEAL plein écran'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => act({ autoplay: !p.autoplay })} data-testid="remote-autoplay">
          {p.autoplay ? <Pause size={18} /> : <Play size={18} />} Diaporama {p.autoplay ? 'actif' : 'arrêté'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => act({ table: !p.table })}>
          <Table size={18} /> Tableaux {p.table ? 'affichés' : 'masqués'}
        </button>
        <button type="button" className={`btn ${p.demo ? 'btn-danger' : 'btn-ghost'}`} onClick={() => act({ demo: !p.demo })} data-testid="remote-demo">
          <FlaskConical size={18} /> {p.demo ? 'Quitter la démonstration' : 'MODE DÉMONSTRATION'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink-2" htmlFor="jump-q">
            Aller à la question
          </label>
          <select
            id="jump-q"
            className="field mt-1"
            value={pos}
            onChange={(e) => act({ view: 'question', pos: Number(e.target.value), revealed: false, explanation: false, revealMode: false })}
            data-testid="remote-jump"
          >
            {sequence.map((id, i) => (
              <option key={id} value={i}>
                {i + 1}. {QUESTION_BY_ID[id].short}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-ink-2" htmlFor="jump-f">
            Afficher un chiffre choc en plein écran
          </label>
          <select id="jump-f" className="field mt-1" value={p.factIndex % FACTS.length} onChange={(e) => act({ view: 'facts', factIndex: Number(e.target.value), spotlight: true })} data-testid="remote-fact">
            {FACTS.map((f, i) => (
              <option key={f.id} value={i}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

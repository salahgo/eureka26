import { useMemo, useState } from 'react';
import { BookOpen, Check, Copy, Download, RotateCcw, X } from 'lucide-react';
import { LETTERS, QUESTION_BY_ID } from '../../data/questions';
import { fr } from '../../lib/format';
import { downloadFile } from '../../lib/storage';
import { route } from '../../lib/urls';
import type { ParticipantExport } from '../../lib/session';
import Brand from '../common/Brand';
import QrCode from '../common/QrCode';
import { copyText, useCountUp } from '../common/hooks';
import { responseCode, type ParticipantState } from './participant';

function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const ratio = total ? correct / total : 0;
  const animated = useCountUp(ratio, { duration: 1600 });
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(51 65 85 / 0.6)" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="url(#score-g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${animated * c} ${c}`} />
        <defs>
          <linearGradient id="score-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-display text-5xl font-bold" data-testid="score" aria-label={`${correct} bonnes réponses sur ${total}`}>
          {correct}
          <span className="text-2xl text-ink-3">/{total}</span>
        </div>
      </div>
    </div>
  );
}

export default function ResultScreen({ state, onRestart }: { state: ParticipantState; onRestart: () => void }) {
  const code = useMemo(() => (Object.keys(state.answers).length ? responseCode(state) : null), [state]);
  const [copied, setCopied] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const answeredIds = state.sequence.filter((id) => state.answers[id] !== undefined);
  const correct = answeredIds.filter((id) => QUESTION_BY_ID[id].correct === state.answers[id]).length;

  const exportJSON = () => {
    if (!code) return;
    const data: ParticipantExport = {
      format: 'eureka26-response',
      version: 1,
      code,
      complete: state.complete,
      answers: Object.fromEntries(answeredIds.map((id) => [id, LETTERS[state.answers[id]]])),
    };
    downloadFile(`eureka26-reponse-${state.id}.json`, JSON.stringify(data, null, 2), 'application/json');
  };

  return (
    <main className="mx-auto max-w-xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Brand size="sm" />
        <a href={route('sources')} className="chip hover:text-ink">
          <BookOpen size={14} aria-hidden="true" /> Sources
        </a>
      </header>

      <section className="rise mt-6 flex justify-center">
        <ScoreRing correct={correct} total={answeredIds.length} />
      </section>

      {code && (
        <section className="rise glass mt-6 rounded-3xl p-5 text-center" style={{ animationDelay: '120ms' }} aria-labelledby="share-title">
          <h2 id="share-title" className="font-display text-xl font-bold">
            {fr("Montrez ce QR code à l'animateur")}
          </h2>
          <div className="mx-auto mt-4 w-full max-w-[19rem] rounded-2xl bg-white p-3 shadow-[0_0_60px_-10px_rgb(34_211_238/0.5)]">
            <QrCode value={code} size="100%" ecc="M" label="QR code de vos réponses anonymes" testId="response-qr" />
          </div>
          <div className="mt-4 flex gap-2">
            <input readOnly value={code} className="field font-mono !text-sm" onFocus={(e) => e.currentTarget.select()} aria-label="Code de réponse" data-testid="response-code" />
            <button
              type="button"
              className="btn btn-ghost shrink-0"
              onClick={async () => {
                setCopied(await copyText(code));
                setTimeout(() => setCopied(false), 2000);
              }}
              aria-label={copied ? 'Code copié' : 'Copier le code'}
            >
              {copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} />}
            </button>
            <button type="button" className="btn btn-ghost shrink-0" onClick={exportJSON} aria-label="Télécharger (JSON)" data-testid="export-json">
              <Download size={18} />
            </button>
          </div>
        </section>
      )}

      <section className="rise mt-6" style={{ animationDelay: '200ms' }} aria-label="Bonnes réponses">
        <ol className="space-y-1.5">
          {state.sequence.map((id, i) => {
            const q = QUESTION_BY_ID[id];
            const a = state.answers[id];
            const status = a === undefined ? 'skip' : a === q.correct ? 'ok' : 'ko';
            return (
              <li key={id} className="flex items-start gap-3 rounded-xl border border-edge bg-panel/50 px-3 py-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    status === 'ok' ? 'bg-emerald-400/20 text-emerald-300' : status === 'ko' ? 'bg-rose-400/20 text-rose-300' : 'bg-slate-700/50 text-ink-3'
                  }`}
                >
                  {status === 'ok' ? <Check size={14} aria-label="Juste" /> : status === 'ko' ? <X size={14} aria-label="Faux" /> : '–'}
                </span>
                <span className="flex-1">
                  <span className="text-ink-3">{i + 1}. </span>
                  <span className="text-ink-2">{fr(q.short)}</span>
                  <span className="block font-medium text-emerald-300">
                    {LETTERS[q.correct]}. {fr(q.choices[q.correct])}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="mt-6">
        {confirmRestart ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-ink-2">Effacer mes réponses ?</span>
            <button type="button" className="btn btn-danger" onClick={onRestart} data-testid="restart-confirm">
              Oui
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmRestart(false)}>
              Non
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost w-full text-ink-2" onClick={() => setConfirmRestart(true)} data-testid="restart">
            <RotateCcw size={16} aria-hidden="true" /> Recommencer
          </button>
        )}
      </footer>
    </main>
  );
}

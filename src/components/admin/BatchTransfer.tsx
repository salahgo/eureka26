import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { encodeBatch } from '../../lib/codec';
import QrCode from '../common/QrCode';

const PER_PAGE = 12;

/**
 * Moves collected codes to another device (e.g. from a phone used as a roaming scanner to the projection laptop)
 * through a sequence of QR codes — still without any server.
 */
export default function BatchTransfer({ codes, onClose }: { codes: string[]; onClose: () => void }) {
  const pages = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < codes.length; i += PER_PAGE) out.push(codes.slice(i, i + PER_PAGE));
    return out;
  }, [codes]);
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages.length), 2500);
    return () => clearInterval(t);
  }, [auto, pages.length]);
  const payload = encodeBatch(pages[page] ?? [], page + 1, pages.length);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Transfert par QR codes" data-testid="batch-transfer">
      <div className="glass w-full max-w-xl rounded-3xl p-5 text-center">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Transfert par QR codes</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="mx-auto mt-4 max-w-[26rem] rounded-2xl bg-white p-3">
          <QrCode value={payload} size="100%" ecc="L" label={`Lot ${page + 1} sur ${pages.length}`} testId="batch-qr" />
        </div>
        <p className="mt-3 font-display text-2xl font-bold">
          Lot {page + 1} / {pages.length}
        </p>
        <p className="text-sm text-ink-3">{pages[page]?.length ?? 0} / {codes.length}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => (p - 1 + pages.length) % pages.length)} aria-label="Lot précédent">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setAuto(!auto)} aria-label={auto ? 'Pause' : 'Défilement automatique'}>
            {auto ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => (p + 1) % pages.length)} aria-label="Lot suivant">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

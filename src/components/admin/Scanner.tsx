import { Camera, CameraOff, ImageUp, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { IngestStatus } from '../../lib/session';
import { decodeCanvas, decodeImageFile, getNativeDetector } from './qrDecode';

export interface ScanFeedback {
  status: IngestStatus | 'batch' | 'empty';
  title: string;
  detail?: string;
}

interface Props {
  /** Called with the raw text of every newly detected QR code. Returns feedback to display. */
  onText: (text: string, via: 'camera' | 'image') => ScanFeedback;
}

const TONE: Record<ScanFeedback['status'], string> = {
  accepted: 'bg-emerald-500/85',
  batch: 'bg-emerald-500/85',
  duplicate: 'bg-amber-500/85',
  conflict: 'bg-amber-500/85',
  invalid: 'bg-rose-600/85',
  empty: 'bg-rose-600/85',
};

function beep(ok: boolean) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 1046 : 220;
    osc.type = ok ? 'sine' : 'square';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => ctx.close();
  } catch {
    /* audio unavailable */
  }
}

function cameraError(e: unknown): string {
  const name = (e as { name?: string })?.name;
  if (!window.isSecureContext) return 'La caméra nécessite une connexion HTTPS (ou localhost). Utilisez l’import d’image ou le collage de codes.';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Accès à la caméra refusé. Autorisez la caméra dans les réglages du navigateur (icône à gauche de l’adresse), puis réessayez — ou utilisez l’import d’image / le collage de codes.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'Aucune caméra détectée sur cet appareil. Branchez une webcam ou utilisez l’import d’image / le collage de codes.';
    case 'NotReadableError':
      return 'La caméra est déjà utilisée par une autre application (visioconférence ?). Fermez-la puis réessayez.';
    default:
      return 'Impossible de démarrer la caméra. Utilisez l’import d’image ou le collage de codes.';
  }
}

export default function Scanner({ onText }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
  const [state, setState] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [engine, setEngine] = useState<'native' | 'jsqr' | null>(null);
  const [flash, setFlash] = useState<ScanFeedback | null>(null);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const [imageMsg, setImageMsg] = useState('');

  const show = (fb: ScanFeedback) => {
    setFlash(fb);
    if (soundRef.current) beep(fb.status === 'accepted' || fb.status === 'batch');
    window.setTimeout(() => setFlash((cur) => (cur === fb ? null : cur)), 1600);
  };

  const stop = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
  };

  const loop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;
    if (video.readyState >= 2 && video.videoWidth) {
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const found = await decodeCanvas(canvas, engine !== 'jsqr');
        for (const text of found) {
          const now = Date.now();
          if (text === lastRef.current.text && now - lastRef.current.at < 3500) continue;
          lastRef.current = { text, at: now };
          show(onTextRef.current(text, 'camera'));
        }
      } catch {
        /* ignore frame */
      }
    }
    timerRef.current = window.setTimeout(loop, 140);
  };

  const start = async (id?: string) => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error');
      setError(cameraError(new Error('unsupported')));
      return;
    }
    stop();
    setState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: id ? { deviceId: { exact: id }, width: { ideal: 1280 }, height: { ideal: 720 } } : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      const list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
      setDevices(list);
      setDeviceId(stream.getVideoTracks()[0]?.getSettings().deviceId ?? id ?? '');
      setEngine((await getNativeDetector()) ? 'native' : 'jsqr');
      setState('running');
      timerRef.current = window.setTimeout(loop, 200);
    } catch (e) {
      stop();
      setState('error');
      setError(cameraError(e));
    }
  };

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const onImage = async (files: FileList | null) => {
    if (!files?.length) return;
    let total = 0;
    for (const file of Array.from(files)) {
      try {
        const texts = await decodeImageFile(file);
        if (!texts.length) {
          show({ status: 'empty', title: `Aucun QR code lisible dans « ${file.name} »` });
          continue;
        }
        for (const t of texts) {
          total++;
          show(onTextRef.current(t, 'image'));
        }
      } catch {
        show({ status: 'empty', title: `Image illisible : ${file.name}` });
      }
    }
    setImageMsg(total ? `${total} QR code(s) lu(s) depuis ${files.length} image(s).` : '');
  };

  return (
    <div className="space-y-3" data-testid="scanner">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-edge bg-black">
        <video ref={videoRef} className={`h-full w-full object-cover ${state === 'running' ? '' : 'opacity-0'}`} muted playsInline aria-label="Aperçu de la caméra" />
        <canvas ref={canvasRef} className="hidden" />
        {state === 'running' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="relative h-[62%] aspect-square rounded-2xl border-2 border-cyan-300/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]">
              <div className="scanline" />
            </div>
          </div>
        )}
        {state !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Camera size={40} className="text-cyan-300" aria-hidden="true" />
            <p className="max-w-md text-ink-2">{state === 'starting' ? 'Démarrage de la caméra…' : 'Scannez les QR codes de réponse des participants avec la caméra de cet ordinateur.'}</p>
            {state !== 'starting' && (
              <button type="button" className="btn btn-primary" onClick={() => start(deviceId || undefined)} data-testid="camera-start">
                <Camera size={18} /> Activer la caméra
              </button>
            )}
          </div>
        )}
        {flash && (
          <div className={`absolute inset-x-0 bottom-0 p-4 text-white ${TONE[flash.status]} pop`} role="status" aria-live="assertive" data-testid="scan-flash">
            <div className="font-display text-xl font-bold">{flash.title}</div>
            {flash.detail && <div className="text-sm opacity-90">{flash.detail}</div>}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100" role="alert" data-testid="camera-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {state === 'running' && (
          <button type="button" className="btn btn-ghost" onClick={stop}>
            <CameraOff size={18} /> Arrêter
          </button>
        )}
        {devices.length > 1 && (
          <select
            className="field !w-auto"
            value={deviceId}
            onChange={(e) => {
              setDeviceId(e.target.value);
              start(e.target.value);
            }}
            aria-label="Choisir la caméra"
          >
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Caméra ${i + 1}`}
              </option>
            ))}
          </select>
        )}
        <label className="btn btn-ghost cursor-pointer">
          <ImageUp size={18} /> Lire une photo de QR
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onImage(e.target.files).finally(() => (e.target.value = ''))} data-testid="image-input" />
        </label>
        <button type="button" className="btn btn-ghost" onClick={() => setSound(!sound)} aria-pressed={sound} aria-label={sound ? 'Couper le son' : 'Activer le son'}>
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {engine && <span className="text-xs text-ink-3">Décodage : {engine === 'native' ? 'natif (BarcodeDetector)' : 'jsQR (intégré)'}</span>}
      </div>
      {imageMsg && <p className="text-sm text-ink-2">{imageMsg}</p>}
    </div>
  );
}

/** QR decoding in the browser: native BarcodeDetector when available, bundled jsQR otherwise. */

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource | ImageBitmap | ImageData): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

let nativeDetector: BarcodeDetectorLike | null | undefined;

export async function getNativeDetector(): Promise<BarcodeDetectorLike | null> {
  if (nativeDetector !== undefined) return nativeDetector;
  const Ctor = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!Ctor) return (nativeDetector = null);
  try {
    const formats = (await Ctor.getSupportedFormats?.()) ?? ['qr_code'];
    nativeDetector = formats.includes('qr_code') ? new Ctor({ formats: ['qr_code'] }) : null;
  } catch {
    nativeDetector = null;
  }
  return nativeDetector;
}

type JsQR = (data: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }) => { data: string } | null;
let jsqr: JsQR | null = null;
export async function getJsQR(): Promise<JsQR> {
  if (!jsqr) jsqr = ((await import('jsqr')).default as unknown) as JsQR;
  return jsqr;
}

/** Decodes the QR codes visible in a canvas. Returns raw strings (possibly several with BarcodeDetector). */
export async function decodeCanvas(canvas: HTMLCanvasElement, preferNative = true, inversion: 'dontInvert' | 'attemptBoth' = 'dontInvert'): Promise<string[]> {
  if (preferNative) {
    const det = await getNativeDetector();
    if (det) {
      try {
        const res = await det.detect(canvas);
        if (res.length) return res.map((r) => r.rawValue);
      } catch {
        /* fall back to jsQR */
      }
    }
  }
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const decode = await getJsQR();
  const r = decode(img.data, img.width, img.height, { inversionAttempts: inversion });
  return r?.data ? [r.data] : [];
}

/** Decodes a QR code from an image file (photo or screenshot), trying several scales. */
export async function decodeImageFile(file: Blob): Promise<string[]> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  for (const maxSide of [1600, 1000, 640, 2400]) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const found = await decodeCanvas(canvas, true, 'attemptBoth');
    if (found.length) {
      bitmap.close?.();
      return found;
    }
  }
  bitmap.close?.();
  return [];
}

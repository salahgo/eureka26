import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { FAKE_CAMERA } from '../../playwright.config';
import { code, qrRaster } from './helpers';

/** Code shown to the fake webcam in camera.spec.ts. */
export const CAMERA_CODE = code('CAMERA01', { Q01: 2, Q21: 3, Q10: 2, Q12: 0 });

/**
 * Builds a Y4M video (the format Chromium's fake capture device reads) that shows a participant's
 * response QR code, so the /admin camera scanner is exercised end-to-end with a real video stream.
 */
export default function globalSetup() {
  const width = 640;
  const height = 480;
  const y = qrRaster(CAMERA_CODE, width, height, 9);
  const uv = Buffer.alloc((width / 2) * (height / 2), 128);
  const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F15:1 Ip A1:1 C420jpeg\n`, 'ascii');
  const frames: Buffer[] = [header];
  for (let i = 0; i < 4; i++) frames.push(Buffer.from('FRAME\n', 'ascii'), Buffer.from(y), uv, uv);
  mkdirSync(path.dirname(FAKE_CAMERA), { recursive: true });
  writeFileSync(FAKE_CAMERA, Buffer.concat(frames));
}

import { expect, type Page } from '@playwright/test';
import jsQR from 'jsqr';
import { encode } from 'uqr';
import { encodeResponse } from '../../src/lib/codec';
import { LETTERS, QUESTION_BY_ID } from '../../src/data/questions';
import type { ChoiceIndex } from '../../src/data/types';

export const BASE = '/eureka26/';
export const PROD_URL = `${(process.env.SITE_URL ?? 'https://salahgo.github.io').replace(/\/$/, '')}${BASE}`;

export function code(id: string, answers: Record<string, ChoiceIndex>, complete = true): string {
  return encodeResponse({ id, answers, complete });
}

/** Rasterises an inline SVG QR code in the page and decodes it with jsQR (the same decoder bundled in /admin). */
export async function readQr(page: Page, testId: string): Promise<string | null> {
  await page.getByTestId(testId).waitFor();
  for (const size of [480, 720, 960]) {
    const pixels = await page.evaluate(
      async ({ tid, size }) => {
        const svg = document.querySelector(`[data-testid="${tid}"]`) as SVGSVGElement | null;
        if (!svg) return null;
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('width', String(size));
        clone.setAttribute('height', String(size));
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const xml = new XMLSerializer().serializeToString(clone);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('svg load failed'));
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
        });
        await img.decode().catch(() => undefined);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        return Array.from(ctx.getImageData(0, 0, size, size).data);
      },
      { tid: testId, size },
    );
    if (!pixels) return null;
    const result = jsQR(Uint8ClampedArray.from(pixels), size, size, { inversionAttempts: 'attemptBoth' });
    if (result?.data) return result.data;
  }
  return null;
}

/** Renders a QR code to an 8-bit grayscale raster (white background, black modules). */
export function qrRaster(value: string, width: number, height: number, moduleSize: number): Uint8Array {
  const qr = encode(value, { ecc: 'M', border: 0 });
  const buf = new Uint8Array(width * height).fill(255);
  const quiet = 4;
  const full = (qr.size + quiet * 2) * moduleSize;
  const ox = Math.floor((width - full) / 2) + quiet * moduleSize;
  const oy = Math.floor((height - full) / 2) + quiet * moduleSize;
  for (let y = 0; y < qr.size; y++)
    for (let x = 0; x < qr.size; x++)
      if (qr.data[y][x])
        for (let dy = 0; dy < moduleSize; dy++) buf.fill(0, (oy + y * moduleSize + dy) * width + ox + x * moduleSize, (oy + y * moduleSize + dy) * width + ox + (x + 1) * moduleSize);
  return buf;
}

/** Minimal PNG encoder (grayscale, no compression dependency): used to feed "photo" uploads in tests. */
export async function grayPng(gray: Uint8Array, width: number, height: number): Promise<Buffer> {
  const { deflateSync, crc32 } = await import('node:zlib');
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0;
    Buffer.from(gray.subarray(y * width, (y + 1) * width)).copy(raw, y * (width + 1) + 1);
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

/** Opens the dashboard and waits until the React island is mounted (keyboard shortcuts active). */
export async function openDashboard(page: Page) {
  await page.goto(`${BASE}results/`);
  await expect(page.getByTestId('dashboard')).toBeVisible();
}

export async function expectNoHorizontalScroll(page: Page) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, 'horizontal overflow').toBeLessThanOrEqual(iw);
}

/** Answers the questionnaire currently displayed. `pick` decides the answer from the question id. */
export async function answerAll(page: Page, pick: (qid: string) => ChoiceIndex, opts: { checkOverflow?: boolean; feedback?: boolean } = {}) {
  const { feedback = true } = opts;
  for (let guard = 0; guard < 40; guard++) {
    const title = page.getByTestId('question-title');
    if (!(await title.isVisible().catch(() => false))) break;
    const qid = (await title.getAttribute('data-question-id'))!;
    const choice = pick(qid);
    await page.getByTestId(`choice-${LETTERS[choice]}`).click();
    await page.getByTestId('validate').click();
    if (feedback) {
      await expect(page.getByTestId('feedback')).toBeVisible();
      await expect(page.getByTestId('feedback')).toContainText(choice === QUESTION_BY_ID[qid].correct ? 'Bonne réponse' : 'Pas tout à fait');
      if (opts.checkOverflow) await expectNoHorizontalScroll(page);
      await page.getByTestId('next').click();
    } else if (opts.checkOverflow) {
      await expectNoHorizontalScroll(page);
    }
    // wait for the next question or the result screen (DOM probes never block)
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.querySelector('[data-testid="score"]') ? 'done' : (document.querySelector('[data-testid="question-title"]')?.getAttribute('data-question-id') ?? 'none'),
        ),
      )
      .not.toBe(qid);
  }
}

export const correctOf = (qid: string) => QUESTION_BY_ID[qid].correct;

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

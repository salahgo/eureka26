import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { decodeResponse } from '../../src/lib/codec';
import { DEFAULT_SEQUENCE } from '../../src/data/questions';
import { answerAll, BASE, code, collectErrors, correctOf, grayPng, openDashboard, PROD_URL, qrRaster, readQr } from './helpers';

async function paste(admin: Page, text: string) {
  await admin.getByTestId('paste-input').fill(text);
  await admin.getByTestId('paste-submit').click();
}

const A = code('AAAAAAAA', { Q01: 2, Q21: 3, Q10: 0 }); // 2 correct (Q01, Q21)
const B = code('BBBBBBBB', { Q01: 0, Q21: 3, Q10: 2 }); // 2 correct (Q21, Q10)
const C = code('CCCCCCCC', { Q01: 2 }, false); // partial, 1 correct

test.describe('presenter collection & aggregation', () => {
  test('real participant code → paste in /admin → aggregated on /results (same browser sync)', async ({ browser }) => {
    // 1. A participant on a phone (separate browser context = separate device storage).
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await phone.newPage();
    await p.goto(BASE);
    await p.getByTestId('start').click();
    await answerAll(p, correctOf);
    const participantCode = await p.getByTestId('response-code').inputValue();
    await phone.close();

    // 2. Presenter computer: /admin and /results open side by side in the same browser profile.
    const presenter = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const admin = await presenter.newPage();
    const errors = collectErrors(admin);
    const results = await presenter.newPage();
    await results.goto(`${BASE}results/`);
    await expect(results.getByTestId('empty-state')).toBeVisible();
    await admin.goto(`${BASE}admin/`);

    await paste(admin, participantCode);
    await expect(admin.getByTestId('count-accepted')).toHaveText('1');
    await expect(admin.getByTestId('import-results')).toContainText('1 acceptée');

    // Results page updates live without reload (BroadcastChannel).
    await expect(results.getByTestId('kpi-submissions')).toContainText('1');
    await expect(results.getByTestId('data-badge')).toContainText('1 réponse collectée');
    await expect(results.getByTestId('kpi-average')).toContainText('100');

    // Duplicate scan of the same code is detected and ignored.
    await paste(admin, participantCode);
    await expect(admin.getByTestId('import-results')).toContainText('1 doublon');
    await expect(admin.getByTestId('count-accepted')).toHaveText('1');
    await expect(admin.getByTestId('count-duplicates')).toHaveText('1');

    // Invalid/tampered code is rejected.
    await paste(admin, participantCode.slice(0, -2) + (participantCode.endsWith('00') ? '11' : '00'));
    await expect(admin.getByTestId('import-results')).toContainText('1 invalide');
    expect(errors).toEqual([]);
    await presenter.close();
  });

  test('aggregation is exact, persists after reload and can be piloted remotely', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const admin = await ctx.newPage();
    const results = await ctx.newPage();
    await admin.goto(`${BASE}admin/`);
    await results.goto(`${BASE}results/`);
    await paste(admin, [A, B, C].join('\n'));
    await expect(admin.getByTestId('count-accepted')).toHaveText('3');

    await expect(results.getByTestId('kpi-submissions')).toContainText('3');
    await expect(results.getByTestId('kpi-completed')).toContainText('2');
    // Scores: A 2/3, B 2/3, C 1/1 → mean 77.8 %, median 66.7 %
    await expect(results.getByTestId('kpi-average')).toContainText('78');
    await expect(results.getByTestId('kpi-median')).toContainText('67');

    // Remote control from /admin drives /results.
    await admin.getByTestId('tab-remote').click();
    await admin.getByTestId('remote-view-question').click();
    await expect(results.getByTestId('question-view')).toHaveAttribute('data-question', 'Q01');
    await expect(results.getByTestId('bar-C')).toHaveAttribute('data-votes', '2');
    await expect(results.getByTestId('bar-A')).toHaveAttribute('data-votes', '1');
    await admin.getByTestId('remote-reveal').click();
    await expect(results.getByTestId('bar-C')).toHaveAttribute('data-correct', 'true');
    await expect(results.getByTestId('pct-correct')).toContainText('67');
    await expect(results.getByTestId('reveal-panel')).toContainText('35');
    await admin.getByTestId('remote-explanation').click();
    await expect(results.getByTestId('explanation')).toBeVisible();
    await admin.getByTestId('remote-next').click();
    await expect(results.getByTestId('question-view')).toHaveAttribute('data-question', DEFAULT_SEQUENCE[1]);
    await expect(results.getByTestId('reveal-panel')).toHaveCount(0);

    // Persistence: reload both pages.
    await admin.reload();
    await results.reload();
    await expect(admin.getByTestId('count-accepted')).toHaveText('3');
    await expect(results.getByTestId('question-view')).toHaveAttribute('data-question', DEFAULT_SEQUENCE[1]);
    await ctx.close();
  });

  test('manual votes are labelled separately and added to the totals', async ({ page }) => {
    await page.goto(`${BASE}admin/#manual`);
    await page.getByTestId('manual-question').selectOption('Q01');
    await page.getByTestId('manual-C').fill('5');
    await page.getByTestId('manual-A').fill('2');
    const results = await page.context().newPage();
    await openDashboard(results);
    await expect(results.getByTestId('kpi-manual')).toContainText('7');
    await results.keyboard.press('2');
    await expect(results.getByTestId('bars-legend')).toContainText('Votes collectés manuellement');
    await expect(results.getByTestId('bar-C')).toHaveAttribute('data-votes', '5');
  });

  test('JSON files and photos of QR codes can be imported', async ({ page }) => {
    await page.goto(`${BASE}admin/`);
    const participantJson = JSON.stringify({ format: 'eureka26-response', version: 1, code: A, complete: true, answers: {} });
    await page.getByTestId('file-input').setInputFiles([
      { name: 'reponse-a.json', mimeType: 'application/json', buffer: Buffer.from(participantJson) },
      { name: 'codes.txt', mimeType: 'text/plain', buffer: Buffer.from(`${B}\n${A}`) },
    ]);
    await expect(page.getByTestId('count-accepted')).toHaveText('2');
    await expect(page.getByTestId('count-duplicates')).toHaveText('1');

    const w = 900;
    const h = 700;
    const png = await grayPng(qrRaster(C, w, h, 8), w, h);
    await page.getByTestId('image-input').setInputFiles({ name: 'photo-qr.png', mimeType: 'image/png', buffer: png });
    await expect(page.getByTestId('scan-flash')).toContainText('Réponse acceptée');
    await expect(page.getByTestId('count-accepted')).toHaveText('3');
  });

  test('export, reset and restore the whole session; CSV exports are correct', async ({ page }) => {
    await page.goto(`${BASE}admin/`);
    await paste(page, [A, B].join(' '));
    await expect(page.getByTestId('count-accepted')).toHaveText('2');
    await page.getByTestId('tab-backup').click();

    const [csv] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-aggregate-csv').click()]);
    const csvText = readFileSync((await csv.path())!, 'utf8');
    expect(csvText).toContain('question_id,ordre,categorie');
    expect(csvText.split('\r\n').filter(Boolean)).toHaveLength(1 + DEFAULT_SEQUENCE.length * 4);

    const [subs] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-submissions-csv').click()]);
    expect(readFileSync((await subs.path())!, 'utf8')).toContain('AAAAAAAA');

    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-session').click()]);
    const sessionPath = (await dl.path())!;
    const saved = JSON.parse(readFileSync(sessionPath, 'utf8'));
    expect(saved.format).toBe('eureka26-session');
    expect(saved.submissions).toHaveLength(2);

    await page.getByTestId('reset-confirm').fill('EFFACER');
    await page.getByTestId('reset').click();
    await expect(page.getByTestId('count-accepted')).toHaveText('0');

    await page.getByTestId('restore-mode').selectOption('replace');
    await page.getByTestId('restore-input').setInputFiles(sessionPath);
    await expect(page.getByTestId('restore-msg')).toContainText('2 réponse(s)');
    await expect(page.getByTestId('count-accepted')).toHaveText('2');

    // Merge mode re-detects duplicates.
    await page.getByTestId('restore-mode').selectOption('merge');
    await page.getByTestId('restore-input').setInputFiles(sessionPath);
    await expect(page.getByTestId('restore-msg')).toContainText('2 doublon');
  });

  test('batch QR transfer encodes every collected code', async ({ page }) => {
    await page.goto(`${BASE}admin/`);
    await paste(page, [A, B, C].join(' '));
    await page.getByTestId('tab-backup').click();
    await page.getByTestId('open-transfer').click();
    const payload = await readQr(page, 'batch-qr');
    expect(payload).toContain('E26LOT-1-1');
    for (const c of [A, B, C]) expect(payload).toContain(c);
  });
});

test.describe('presentation dashboard', () => {
  test('demo mode is clearly labelled and never stored as real results', async ({ page }) => {
    await openDashboard(page);
    await page.keyboard.press('d');
    await expect(page.getByTestId('demo-banner')).toContainText('MODE DÉMONSTRATION');
    await expect(page.getByTestId('data-badge')).toContainText('MODE DÉMONSTRATION');
    await expect(page.getByTestId('kpi-submissions')).toContainText('142');
    const stored = await page.evaluate(() => localStorage.getItem('eureka26:session:v1'));
    expect(stored === null || JSON.parse(stored).submissions.length === 0).toBe(true);
    const admin = await page.context().newPage();
    await admin.goto(`${BASE}admin/`);
    await expect(admin.getByTestId('count-accepted')).toHaveText('0');
    await page.keyboard.press('d');
    await expect(page.getByTestId('demo-banner')).toHaveCount(0);
  });

  test('keyboard navigation, reveal, REVEAL mode with animated figure, facts spotlight, views', async ({ page }) => {
    await openDashboard(page);
    await page.keyboard.press('2');
    await expect(page.getByTestId('question-view')).toHaveAttribute('data-question', 'Q01');
    await expect(page.getByTestId('no-votes')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('bar-C')).toHaveAttribute('data-correct', 'true');
    await page.keyboard.press('e');
    await expect(page.getByTestId('explanation')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('question-view')).toHaveAttribute('data-question', DEFAULT_SEQUENCE[1]);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('r');
    await expect(page.getByTestId('reveal-overlay')).toBeVisible();
    await expect(page.getByTestId('reveal-countdown')).toBeVisible();
    await expect(page.getByTestId('reveal-answer')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('reveal-answer').locator('[data-value="35000"]')).toHaveText(/35\s?000/, { timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('reveal-overlay')).toHaveCount(0);

    await page.keyboard.press('3');
    await expect(page.getByTestId('facts-view')).toBeVisible();
    await page.getByTestId('fact-F-jlr-cost').click();
    await expect(page.getByTestId('fact-spotlight')).toContainText('Jaguar Land Rover');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('fact-spotlight')).toContainText('5 000');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('fact-spotlight')).toHaveCount(0);

    await page.keyboard.press('4');
    await expect(page.getByTestId('management-view')).toContainText('Zero Trust');
    await expect(page.getByTestId('management-view')).toContainText('Souveraineté numérique');
    await page.keyboard.press('5');
    await expect(page.getByTestId('future-view')).toContainText('Management IA-conscient, sécurisé et résilient');
    await expect(page.getByTestId('future-view')).toContainText('pas une prévision statistique');
    await page.keyboard.press('o');
    await expect(page.getByTestId('dashboard')).toHaveAttribute('data-view', 'overview');
  });

  test('fullscreen presentation mode', async ({ page }) => {
    await openDashboard(page);
    await page.getByTestId('fullscreen').click();
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await page.keyboard.press('f');
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  });

  test('autoplay advances the presentation', async ({ page }) => {
    await page.goto(`${BASE}admin/#questions`);
    await page.locator('#autoplay').fill('4');
    await openDashboard(page);
    await page.keyboard.press('2');
    await page.keyboard.press('a');
    await expect(page.getByTestId('bar-C')).toHaveAttribute('data-correct', 'true', { timeout: 7000 });
    await expect(page.getByTestId('question-view')).toHaveAttribute('data-question', DEFAULT_SEQUENCE[1], { timeout: 7000 });
    await page.keyboard.press('a');
  });

  test('4K projection keeps the layout within the screen', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 3840, height: 2160 } });
    const page = await ctx.newPage();
    await openDashboard(page);
    await page.keyboard.press('d');
    await page.keyboard.press('2');
    await page.keyboard.press('Space');
    const { sw, sh } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }));
    expect(sw).toBeLessThanOrEqual(3840);
    expect(sh).toBeLessThanOrEqual(2160);
    const fontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    expect(fontSize).toBeGreaterThan(30);
    await ctx.close();
  });
});

test.describe('invitation QR', () => {
  test('production QR code points to the public GitHub Pages URL, never localhost', async ({ page }) => {
    await page.goto(`${BASE}qr/`);
    await expect(page.getByTestId('invite-url')).toHaveText(PROD_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''));
    expect(await readQr(page, 'invite-qr')).toBe(PROD_URL);
  });

  test('custom selection and no-feedback mode are carried by the invitation URL', async ({ page }) => {
    await page.goto(`${BASE}admin/#questions`);
    await page.getByTestId('preset-all').click();
    await page.getByTestId('phone-feedback').uncheck();
    await expect(page.getByTestId('invite-preview')).toContainText('?s=');
    const qr = await page.context().newPage();
    await qr.goto(`${BASE}qr/`);
    const expected = await qr.getByTestId('invite-qr').getAttribute('data-qr-value');
    const url = (await readQr(qr, 'invite-qr'))!;
    expect(url, `QR (version ${await qr.getByTestId('invite-qr').getAttribute('data-qr-version')}) should decode to ${expected}`).toBe(expected);
    expect(url.startsWith(PROD_URL)).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get('f')).toBe('0');
    expect(params.get('s')).toHaveLength(29);
    // The participant opening that URL gets all 29 questions.
    const phone = await page.context().browser()!.newContext({ viewport: { width: 390, height: 844 } });
    const p = await phone.newPage();
    await p.goto(`${BASE}?${params.toString()}`);
    await expect(p.getByText('29', { exact: true })).toBeVisible();
    await phone.close();
  });
});

test('decoding a participant code yields the anonymous id and answers only', () => {
  const d = decodeResponse(A);
  expect(Object.keys(d).sort()).toEqual(['answers', 'code', 'complete', 'id', 'slots']);
});

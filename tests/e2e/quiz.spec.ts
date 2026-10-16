import { expect, test } from '@playwright/test';
import { decodeResponse } from '../../src/lib/codec';
import { DEFAULT_SEQUENCE, QUESTION_BY_ID } from '../../src/data/questions';
import type { ChoiceIndex } from '../../src/data/types';
import { answerAll, BASE, collectErrors, correctOf, expectNoHorizontalScroll, readQr } from './helpers';

for (const width of [360, 390, 430]) {
  test.describe(`mobile ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });

    test('complete questionnaire with all correct answers, response QR decodes to the code', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(BASE);
      await expectNoHorizontalScroll(page);
      await expect(page.getByText('« Cyberattaques, IA et management : connaissez-vous vraiment les chiffres ? »'.replace(/ ([?:»])/g, ' $1').replace('« ', '« '))).toBeVisible();
      await page.getByTestId('start').click();
      await expect(page.getByTestId('question-title')).toHaveAttribute('data-question-id', DEFAULT_SEQUENCE[0]);
      await answerAll(page, correctOf, { checkOverflow: true });

      await expect(page.getByTestId('score')).toContainText('16/16');
      await expectNoHorizontalScroll(page);
      const codeText = await page.getByTestId('response-code').inputValue();
      const decoded = decodeResponse(codeText);
      expect(decoded.complete).toBe(true);
      expect(Object.keys(decoded.answers).sort()).toEqual([...DEFAULT_SEQUENCE].sort());
      for (const [qid, a] of Object.entries(decoded.answers)) expect(a).toBe(QUESTION_BY_ID[qid].correct);
      expect(await readQr(page, 'response-qr')).toBe(codeText);
      expect(errors).toEqual([]);
    });
  });
}

test.describe('questionnaire behaviour', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('wrong answers are corrected and every question shows a management insight', async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId('start').click();
    const qid = (await page.getByTestId('question-title').getAttribute('data-question-id'))!;
    const wrong = ((correctOf(qid) + 1) % 4) as ChoiceIndex;
    await page.getByTestId(`choice-${'ABCD'[wrong]}`).click();
    await expect(page.getByTestId('validate')).toBeEnabled();
    await page.getByTestId('validate').click();
    await expect(page.getByTestId('feedback')).toContainText('Pas tout à fait');
    await expect(page.getByTestId('feedback')).toContainText('Pour le manager');
    await expect(page.getByTestId(`choice-${'ABCD'[correctOf(qid)]}`)).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: 'En savoir plus' }).click();
    await expect(page.getByTestId('feedback')).toContainText('Source');
  });

  test('progress persists after reload', async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId('start').click();
    for (let i = 0; i < 3; i++) {
      const qid = (await page.getByTestId('question-title').getAttribute('data-question-id'))!;
      await page.getByTestId(`choice-${'ABCD'[correctOf(qid)]}`).click();
      await page.getByTestId('validate').click();
      await page.getByTestId('next').click();
    }
    await expect(page.getByTestId('question-title')).toHaveAttribute('data-question-id', DEFAULT_SEQUENCE[3]);
    await page.reload();
    await expect(page.getByTestId('question-title')).toHaveAttribute('data-question-id', DEFAULT_SEQUENCE[3]);
    await expect(page.getByText('4', { exact: true }).first()).toBeVisible();
  });

  test('leaving early produces a partial response code', async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId('start').click();
    const qid = (await page.getByTestId('question-title').getAttribute('data-question-id'))!;
    await page.getByTestId(`choice-${'ABCD'[correctOf(qid)]}`).click();
    await page.getByTestId('validate').click();
    await page.getByRole('button', { name: /terminer maintenant/ }).click();
    await page.getByTestId('stop-confirm').click();
    const decoded = decodeResponse(await page.getByTestId('response-code').inputValue());
    expect(decoded.complete).toBe(false);
    expect(decoded.answers).toEqual({ [qid]: correctOf(qid) });
  });

  test('a custom subset from the invitation URL (?s=) and no-feedback mode (?f=0)', async ({ page }) => {
    await page.goto(`${BASE}?s=1AC&f=0`);
    await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
    await page.getByTestId('start').click();
    await answerAll(page, () => 0, { feedback: false });
    await expect(page.getByTestId('score')).toBeVisible();
    const decoded = decodeResponse(await page.getByTestId('response-code').inputValue());
    expect(Object.keys(decoded.answers)).toEqual(['Q01', 'Q10', 'Q12']);
  });

  test('participant JSON export contains the code and no personal data', async ({ page }) => {
    await page.goto(`${BASE}?s=12`);
    await page.getByTestId('start').click();
    await answerAll(page, correctOf);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-json').click()]);
    const json = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString('utf8')));
    expect(json.format).toBe('eureka26-response');
    expect(decodeResponse(json.code).answers).toEqual({ Q01: 2, Q02: 2 });
    expect(Object.keys(json).sort()).toEqual(['answers', 'code', 'complete', 'format', 'version']);
  });

  test('restart clears the local session', async ({ page }) => {
    await page.goto(`${BASE}?s=1`);
    await page.getByTestId('start').click();
    await answerAll(page, correctOf);
    const first = await page.getByTestId('response-code').inputValue();
    await page.getByRole('button', { name: 'Recommencer le questionnaire' }).click();
    await page.getByTestId('restart-confirm').click();
    await expect(page.getByTestId('start')).toHaveText(/Je relève le défi/);
    await page.getByTestId('start').click();
    await answerAll(page, correctOf);
    const second = await page.getByTestId('response-code').inputValue();
    expect(decodeResponse(second).id).not.toBe(decodeResponse(first).id);
  });
});

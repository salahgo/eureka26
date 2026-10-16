import { expect, test, type Page } from '@playwright/test';
import { BASE, correctOf, openDashboard } from './helpers';

/** Generates the README screenshots (run with `npm run screenshots`). */
const OUT = 'docs/screenshots';
const shot = (page: Page, name: string) => page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });

test.describe.configure({ mode: 'serial' });

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  test('questionnaire screens', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByTestId('start')).toBeVisible();
    await page.waitForTimeout(700);
    await shot(page, 'mobile-1-accueil');
    await page.getByTestId('start').click();
    const qid = (await page.getByTestId('question-title').getAttribute('data-question-id'))!;
    await page.getByTestId('choice-B').click();
    await page.waitForTimeout(400);
    await shot(page, 'mobile-2-question');
    await page.getByTestId('validate').click();
    await page.waitForTimeout(1700);
    await shot(page, 'mobile-3-correction');
    expect(qid).toBe('Q01');
    // finish quickly with correct answers
    for (let i = 0; i < 40; i++) {
      if (await page.getByTestId('score').count()) break;
      const next = page.getByTestId('next');
      if (await next.count()) {
        await next.click();
        continue;
      }
      const id = await page.getByTestId('question-title').getAttribute('data-question-id');
      await page.getByTestId(`choice-${'ABCD'[correctOf(id!)]}`).click();
      await page.getByTestId('validate').click();
    }
    await expect(page.getByTestId('score')).toBeVisible();
    await page.waitForTimeout(1800);
    await shot(page, 'mobile-4-score');
    await page.getByTestId('response-qr').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForTimeout(300);
    await shot(page, 'mobile-5-qr-reponses');
  });
});

test.describe('projection 1920×1080', () => {
  test.use({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  test('invitation QR screen', async ({ page }) => {
    await page.goto(`${BASE}qr/`);
    await expect(page.getByTestId('invite-qr')).toBeVisible();
    await page.waitForTimeout(1200);
    await shot(page, 'projection-1-qr');
  });

  test('results dashboard', async ({ page }) => {
    await openDashboard(page);
    await page.waitForTimeout(800);
    await shot(page, 'projection-2-resultats-vide');
    await page.keyboard.press('d');
    await page.waitForTimeout(2200);
    await shot(page, 'projection-3-vue-ensemble-demo');
    await page.keyboard.press('2');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await shot(page, 'projection-4-question-masquee-demo');
    await page.keyboard.press('Space');
    await page.waitForTimeout(2400);
    await shot(page, 'projection-5-question-revelee-demo');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('r');
    await expect(page.getByTestId('reveal-answer')).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(2600);
    await shot(page, 'projection-6-reveal');
    await page.keyboard.press('Escape');
    await page.keyboard.press('3');
    await page.waitForTimeout(2600);
    await shot(page, 'projection-7-chiffres-chocs');
    await page.getByTestId('fact-F-glasswing-oct').click();
    await page.waitForTimeout(2600);
    await shot(page, 'projection-8-chiffre-plein-ecran');
    await page.keyboard.press('Escape');
    await page.keyboard.press('4');
    await page.waitForTimeout(1500);
    await shot(page, 'projection-9-management-demo');
    await page.keyboard.press('5');
    await page.waitForTimeout(1800);
    await shot(page, 'projection-10-futur');
    await page.keyboard.press('d');
  });
});

test.describe('presenter', () => {
  test.use({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

  test('admin screens', async ({ page }) => {
    await page.goto(`${BASE}admin/`);
    await expect(page.getByTestId('scanner')).toBeVisible();
    await page.waitForTimeout(500);
    await shot(page, 'admin-1-collecte');
    await page.getByTestId('tab-remote').click();
    await page.waitForTimeout(300);
    await shot(page, 'admin-2-telecommande');
    await page.getByTestId('tab-questions').click();
    await page.waitForTimeout(300);
    await shot(page, 'admin-3-questions');
  });
});

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { BASE, collectErrors } from './helpers';

const ROUTES = [
  { path: '', heading: /EUREKA/, title: /EUREKA26/ },
  { path: 'qr/', heading: /35\s?000 cyberattaques DDoS/, title: /Scannez/ },
  { path: 'results/', heading: /Aucune réponse du public/, title: /Résultats/ },
  { path: 'sources/', heading: /Sources, méthodologie et glossaire/, title: /Sources/ },
  { path: 'admin/', heading: /Scanner les QR codes de réponse/, title: /animateur/ },
];

test.describe('static routes', () => {
  for (const r of ROUTES) {
    test(`direct access ${BASE}${r.path} renders without errors and survives reload`, async ({ page }) => {
      const errors = collectErrors(page);
      const res = await page.goto(`${BASE}${r.path}`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(r.title);
      await expect(page.getByText(r.heading).first()).toBeVisible();
      await page.reload();
      await expect(page.getByText(r.heading).first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('routes without trailing slash resolve', async ({ page }) => {
    for (const p of ['qr', 'results', 'sources', 'admin']) {
      const res = await page.goto(`${BASE}${p}`);
      expect(res?.status(), p).toBe(200);
      expect(page.url()).toContain(`${BASE}${p}`);
    }
  });

  test('unknown route serves the French 404 page', async ({ page }) => {
    const res = await page.goto(`${BASE}nexiste-pas/`);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Cette page n’existe pas' })).toBeVisible();
  });

  test('no request leaves the site (no CDN, no analytics, no external API)', async ({ page, baseURL }) => {
    const external: string[] = [];
    page.on('request', (req) => {
      const u = new URL(req.url());
      if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== new URL(baseURL!).origin) external.push(req.url());
    });
    for (const r of ROUTES) {
      await page.goto(`${BASE}${r.path}`);
      await page.waitForLoadState('networkidle');
    }
    expect(external).toEqual([]);
  });

  test('all audience-facing pages declare French', async ({ page }) => {
    for (const r of ROUTES) {
      await page.goto(`${BASE}${r.path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    }
  });
});

test.describe('accessibility (axe-core, WCAG 2 A/AA)', () => {
  for (const r of ROUTES) {
    test(`${r.path || 'questionnaire'} has no serious accessibility violations`, async ({ page }) => {
      await page.goto(`${BASE}${r.path}`);
      await expect(page.getByText(r.heading).first()).toBeVisible();
      await page.waitForTimeout(900); // let entrance animations settle (contrast is measured on final colours)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
});

test.describe('performance budget', () => {
  test('questionnaire ships less than 350 KB of JavaScript (uncompressed) and loads fast', async ({ page }) => {
    let jsBytes = 0;
    page.on('response', async (res) => {
      if (res.url().endsWith('.js')) jsBytes += (await res.body()).length;
    });
    const t0 = Date.now();
    await page.goto(BASE);
    await expect(page.getByTestId('start')).toBeVisible();
    const elapsed = Date.now() - t0;
    await page.waitForLoadState('networkidle');
    expect(jsBytes).toBeLessThan(350 * 1024);
    expect(elapsed).toBeLessThan(5000);
  });
});

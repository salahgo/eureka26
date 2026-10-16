import { expect, test } from '@playwright/test';
import { BASE } from './helpers';
import { CAMERA_CODE } from './global-setup';

/**
 * Chromium is started with a fake webcam that streams a video of a participant's response QR code
 * (see global-setup.ts). This exercises getUserMedia → frame capture → QR decoding → ingest.
 */
test('the /admin camera scanner reads a response QR code from a live video stream', async ({ page }) => {
  await page.goto(`${BASE}admin/`);
  await page.getByTestId('camera-start').click();
  await expect(page.getByTestId('scan-flash')).toContainText('Réponse acceptée', { timeout: 20_000 });
  await expect(page.getByTestId('count-accepted')).toHaveText('1');
  // The same QR stays in front of the camera: it must not be counted twice.
  await page.waitForTimeout(4500);
  await expect(page.getByTestId('count-accepted')).toHaveText('1');
  await page.getByTestId('tab-submissions').click();
  await expect(page.getByTestId('submissions-table')).toContainText('CAMERA01');
  expect(CAMERA_CODE).toContain('CAMERA01');
});

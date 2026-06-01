import { expect, test, type Page } from '@playwright/test';

async function addEssential(page: Page, text: string) {
  await page.getByRole('button', { name: 'add an essential' }).click();
  const input = page.getByLabel('New essential');
  await input.fill(text);
  await input.press('Enter');
}

test('caps the list at three and rests when all are done', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();

  await addEssential(page, 'First');
  await addEssential(page, 'Second');
  await addEssential(page, 'Third');

  // The cap: no fourth, and the calm note appears.
  await expect(page.getByRole('button', { name: 'add an essential' })).toHaveCount(0);
  await expect(page.getByText('3 is enough. Focus here.')).toBeVisible();

  // Complete all three.
  await page.getByRole('checkbox', { name: 'First' }).click();
  await page.getByRole('checkbox', { name: 'Second' }).click();
  await page.getByRole('checkbox', { name: 'Third' }).click();
  await expect(page.getByText(/Rest now/)).toBeVisible();
});

test('persists across a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tomorrow' }).click();
  await addEssential(page, 'Tomorrow plan');

  await page.reload();
  await page.getByRole('button', { name: 'Tomorrow' }).click();
  await expect(page.getByText('Tomorrow plan')).toBeVisible();
});

test('carries an unfinished past item into today', async ({ page }) => {
  await page.goto('/');

  // Seed a past, unfinished day directly, then reload so reconcile runs.
  await page.evaluate(() => {
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - 2);
    const key = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(
      past.getDate(),
    ).padStart(2, '0')}`;
    localStorage.setItem(
      'essentials-v1',
      JSON.stringify({
        version: 1,
        settings: { max: 3, theme: 'paper', accent: '#6f8a72', showIntention: true },
        days: { [key]: [{ id: 'old', text: 'Unfinished from before', done: false }] },
        intentions: {},
      }),
    );
  });

  await page.reload();
  await expect(page.getByText('Unfinished from before')).toBeVisible();
  await expect(page.getByText('carried over')).toBeVisible();
});

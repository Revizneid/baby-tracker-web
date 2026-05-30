import { test, expect } from '@playwright/test';

test.describe('BabyTracker Web smoke tests', () => {
  test('renders login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/BabyTracker/);
    await expect(page.locator('text=Tiếp tục với Google')).toBeVisible();
  });

  test('redirects unauthenticated user from dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('404 page renders for unknown route', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.locator('text=Trang không tìm thấy')).toBeVisible();
  });
});

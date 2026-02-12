import { test, expect } from '@playwright/test';

test.describe('Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('defaults to 2D mode', async ({ page }) => {
    await expect(page.locator('#mode-2d')).toHaveClass(/active/);
    await expect(page.locator('#mode-3d')).not.toHaveClass(/active/);
    await expect(page.locator('#controls-2d')).toBeVisible();
    await expect(page.locator('#controls-3d')).toBeHidden();
  });

  test('orbit hint is hidden in 2D mode', async ({ page }) => {
    await expect(page.locator('#orbit-hint')).toBeHidden();
  });

  test('switches to 3D mode', async ({ page }) => {
    await page.click('#mode-3d');
    await page.waitForTimeout(200);

    await expect(page.locator('#mode-3d')).toHaveClass(/active/);
    await expect(page.locator('#mode-2d')).not.toHaveClass(/active/);
    await expect(page.locator('#controls-3d')).toBeVisible();
    await expect(page.locator('#controls-2d')).toBeHidden();
  });

  test('orbit hint is shown in 3D mode', async ({ page }) => {
    await page.click('#mode-3d');
    await page.waitForTimeout(200);

    await expect(page.locator('#orbit-hint')).toBeVisible();
    await expect(page.locator('#orbit-hint')).toContainText('Drag to orbit');
  });

  test('switches back to 2D mode', async ({ page }) => {
    await page.click('#mode-3d');
    await page.waitForTimeout(200);
    await page.click('#mode-2d');
    await page.waitForTimeout(200);

    await expect(page.locator('#mode-2d')).toHaveClass(/active/);
    await expect(page.locator('#mode-3d')).not.toHaveClass(/active/);
    await expect(page.locator('#controls-2d')).toBeVisible();
    await expect(page.locator('#controls-3d')).toBeHidden();
    await expect(page.locator('#orbit-hint')).toBeHidden();
  });

  test('canvas is recreated with correct size after toggle', async ({ page }) => {
    await page.click('#mode-3d');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBe(400);
    expect(box.height).toBe(400);
  });

  test('canvas works after switching back to 2D', async ({ page }) => {
    await page.click('#mode-3d');
    await page.waitForTimeout(200);
    await page.click('#mode-2d');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBe(400);
    expect(box.height).toBe(400);

    // Verify 2D controls still work
    await expect(page.locator('#shape-select')).toHaveValue('rectangle');
  });

  test('clicking already active mode does nothing', async ({ page }) => {
    await page.click('#mode-2d');
    await expect(page.locator('#mode-2d')).toHaveClass(/active/);
    await expect(page.locator('#controls-2d')).toBeVisible();
  });

  test('2D editor retains state after round-trip toggle', async ({ page }) => {
    // Change a 2D slider value
    await page.locator('#pos-x').fill('150');
    await page.locator('#pos-x').dispatchEvent('input');

    // Toggle to 3D and back
    await page.click('#mode-3d');
    await page.waitForTimeout(200);
    await page.click('#mode-2d');
    await page.waitForTimeout(200);

    // Slider should retain its value
    await expect(page.locator('#pos-x')).toHaveValue('150');
  });
});

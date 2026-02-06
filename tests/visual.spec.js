import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    // Wait for p5.js to complete initial draw
    await page.waitForTimeout(500);
  });

  const shapes = ['rectangle', 'ellipse', 'triangle', 'line', 'quad', 'arc', 'point', 'freeform'];

  for (const shape of shapes) {
    test(`${shape} default render`, async ({ page }) => {
      await page.selectOption('#shape-select', shape);
      await page.waitForTimeout(200);

      await expect(page.locator('canvas')).toHaveScreenshot(`${shape}-default.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  }

  test('rectangle with custom style', async ({ page }) => {
    await page.selectOption('#shape-select', 'rectangle');
    await page.locator('#fill-color').fill('#ff0000');
    await page.locator('#stroke-color').fill('#0000ff');
    await page.locator('#stroke-weight').fill('8');
    await page.locator('#stroke-weight').dispatchEvent('input');
    await page.waitForTimeout(200);

    await expect(page.locator('canvas')).toHaveScreenshot('rectangle-custom-style.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('ellipse resized', async ({ page }) => {
    await page.selectOption('#shape-select', 'ellipse');
    await page.locator('#dim-w').fill('300');
    await page.locator('#dim-w').dispatchEvent('input');
    await page.locator('#dim-h').fill('150');
    await page.locator('#dim-h').dispatchEvent('input');
    await page.waitForTimeout(200);

    await expect(page.locator('canvas')).toHaveScreenshot('ellipse-resized.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('shape repositioned', async ({ page }) => {
    await page.selectOption('#shape-select', 'rectangle');
    await page.locator('#pos-x').fill('100');
    await page.locator('#pos-x').dispatchEvent('input');
    await page.locator('#pos-y').fill('300');
    await page.locator('#pos-y').dispatchEvent('input');
    await page.waitForTimeout(200);

    await expect(page.locator('canvas')).toHaveScreenshot('rectangle-repositioned.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('arc with custom angles', async ({ page }) => {
    await page.selectOption('#shape-select', 'arc');
    await page.locator('#arc-start').fill('45');
    await page.locator('#arc-start').dispatchEvent('input');
    await page.locator('#arc-stop').fill('270');
    await page.locator('#arc-stop').dispatchEvent('input');
    await page.waitForTimeout(200);

    await expect(page.locator('canvas')).toHaveScreenshot('arc-custom-angles.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('arc chord mode', async ({ page }) => {
    await page.selectOption('#shape-select', 'arc');
    await page.selectOption('#arc-mode', 'CHORD');
    await page.waitForTimeout(200);

    await expect(page.locator('canvas')).toHaveScreenshot('arc-chord-mode.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});

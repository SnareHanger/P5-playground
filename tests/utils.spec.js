import { test, expect } from '@playwright/test';

// Tests for utility functions accessed via the browser
test.describe('Utility Functions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test.describe('pointToSegmentDistance', () => {
    test('point on segment returns distance near 0', async ({ page }) => {
      const result = await page.evaluate(() => {
        return pointToSegmentDistance(5, 5, 0, 0, 10, 10);
      });

      expect(result.dist).toBeLessThan(0.1);
    });

    test('point perpendicular to segment midpoint', async ({ page }) => {
      const result = await page.evaluate(() => {
        return pointToSegmentDistance(5, 0, 0, 5, 10, 5);
      });

      expect(result.dist).toBeCloseTo(5, 0);
    });
  });

  test.describe('shapeControls configuration', () => {
    test('rectangle has correct config', async ({ page }) => {
      const config = await page.evaluate(() => shapeControls.rectangle);

      expect(config.dimensions).toBe(true);
      expect(config.arc).toBe(false);
      expect(config.fill).toBe(true);
    });

    test('point has no dimensions or fill', async ({ page }) => {
      const config = await page.evaluate(() => shapeControls.point);

      expect(config.dimensions).toBe(false);
      expect(config.fill).toBe(false);
    });

    test('line has no fill', async ({ page }) => {
      const config = await page.evaluate(() => shapeControls.line);

      expect(config.dimensions).toBe(true);
      expect(config.fill).toBe(false);
    });

    test('arc has arc controls', async ({ page }) => {
      const config = await page.evaluate(() => shapeControls.arc);

      expect(config.arc).toBe(true);
      expect(config.dimensions).toBe(true);
      expect(config.fill).toBe(true);
    });

    test('freeform has no dimensions', async ({ page }) => {
      const config = await page.evaluate(() => shapeControls.freeform);

      expect(config.dimensions).toBe(false);
      expect(config.fill).toBe(true);
    });
  });
});

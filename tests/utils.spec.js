import { test, expect } from '@playwright/test';

// Unit tests for utility functions
// These test the pure functions extracted from sketch.js

test.describe('Utility Functions', () => {
  test.describe('pointToSegmentDistance', () => {
    // Test the distance calculation logic

    test('point on segment returns distance near 0', async ({ page }) => {
      await page.goto('/');

      const result = await page.evaluate(() => {
        // Access the function from the global scope
        return pointToSegmentDistance(5, 5, 0, 0, 10, 10);
      });

      expect(result.dist).toBeLessThan(0.001);
      expect(result.t).toBeCloseTo(0.5);
    });

    test('point perpendicular to segment midpoint', async ({ page }) => {
      await page.goto('/');

      const result = await page.evaluate(() => {
        // Point at (5, 0), segment from (0, 5) to (10, 5)
        return pointToSegmentDistance(5, 0, 0, 5, 10, 5);
      });

      expect(result.dist).toBeCloseTo(5);
      expect(result.t).toBeCloseTo(0.5);
    });

    test('point closest to segment start', async ({ page }) => {
      await page.goto('/');

      const result = await page.evaluate(() => {
        // Point at (-5, 0), segment from (0, 0) to (10, 0)
        return pointToSegmentDistance(-5, 0, 0, 0, 10, 0);
      });

      expect(result.t).toBe(0);
      expect(result.nearestX).toBe(0);
      expect(result.nearestY).toBe(0);
    });

    test('point closest to segment end', async ({ page }) => {
      await page.goto('/');

      const result = await page.evaluate(() => {
        // Point at (15, 0), segment from (0, 0) to (10, 0)
        return pointToSegmentDistance(15, 0, 0, 0, 10, 0);
      });

      expect(result.t).toBe(1);
      expect(result.nearestX).toBe(10);
      expect(result.nearestY).toBe(0);
    });
  });

  test.describe('shapeControls configuration', () => {
    test('rectangle has correct config', async ({ page }) => {
      await page.goto('/');

      const config = await page.evaluate(() => shapeControls.rectangle);

      expect(config.dimensions).toBe(true);
      expect(config.arc).toBe(false);
      expect(config.fill).toBe(true);
    });

    test('point has no dimensions or fill', async ({ page }) => {
      await page.goto('/');

      const config = await page.evaluate(() => shapeControls.point);

      expect(config.dimensions).toBe(false);
      expect(config.fill).toBe(false);
    });

    test('line has no fill', async ({ page }) => {
      await page.goto('/');

      const config = await page.evaluate(() => shapeControls.line);

      expect(config.dimensions).toBe(true);
      expect(config.fill).toBe(false);
    });

    test('arc has arc controls', async ({ page }) => {
      await page.goto('/');

      const config = await page.evaluate(() => shapeControls.arc);

      expect(config.arc).toBe(true);
      expect(config.dimensions).toBe(true);
      expect(config.fill).toBe(true);
    });

    test('freeform has no dimensions', async ({ page }) => {
      await page.goto('/');

      const config = await page.evaluate(() => shapeControls.freeform);

      expect(config.dimensions).toBe(false);
      expect(config.fill).toBe(true);
    });
  });

  test.describe('getAnchors', () => {
    test('rectangle returns 5 anchors (center + 4 corners)', async ({ page }) => {
      await page.goto('/');

      const anchors = await page.evaluate(() => {
        return getAnchors('rectangle', 200, 200, 100, 100);
      });

      expect(anchors).toHaveLength(5);
      expect(anchors[0].role).toBe('center');
      expect(anchors[1].role).toBe('topLeft');
      expect(anchors[2].role).toBe('topRight');
      expect(anchors[3].role).toBe('bottomRight');
      expect(anchors[4].role).toBe('bottomLeft');
    });

    test('rectangle anchor positions are correct', async ({ page }) => {
      await page.goto('/');

      const anchors = await page.evaluate(() => {
        return getAnchors('rectangle', 200, 200, 100, 100);
      });

      // Center
      expect(anchors[0].x).toBe(200);
      expect(anchors[0].y).toBe(200);

      // Top-left (x - w/2, y - h/2)
      expect(anchors[1].x).toBe(150);
      expect(anchors[1].y).toBe(150);

      // Top-right (x + w/2, y - h/2)
      expect(anchors[2].x).toBe(250);
      expect(anchors[2].y).toBe(150);
    });

    test('point returns single center anchor', async ({ page }) => {
      await page.goto('/');

      const anchors = await page.evaluate(() => {
        return getAnchors('point', 200, 200, 100, 100);
      });

      expect(anchors).toHaveLength(1);
      expect(anchors[0].role).toBe('center');
    });

    test('arc returns 7 anchors including angle anchors', async ({ page }) => {
      await page.goto('/');

      const anchors = await page.evaluate(() => {
        return getAnchors('arc', 200, 200, 100, 100);
      });

      expect(anchors).toHaveLength(7);

      const roles = anchors.map(a => a.role);
      expect(roles).toContain('center');
      expect(roles).toContain('arcStart');
      expect(roles).toContain('arcStop');
    });

    test('freeform returns vertex anchors', async ({ page }) => {
      await page.goto('/');

      // First switch to freeform to initialize vertices
      await page.selectOption('#shape-select', 'freeform');

      const anchors = await page.evaluate(() => {
        return getAnchors('freeform', 200, 200, 100, 100);
      });

      expect(anchors.length).toBeGreaterThanOrEqual(4);
      expect(anchors[0].role).toBe('freeformVertex');
    });
  });
});

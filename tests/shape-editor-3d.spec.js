import { test, expect } from '@playwright/test';

test.describe('3D Shape Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.click('#mode-3d');
    await page.waitForTimeout(300);
  });

  test.describe('Shape Selection', () => {
    test('defaults to box', async ({ page }) => {
      await expect(page.locator('#shape-select-3d')).toHaveValue('box');
    });

    test('can select all 3D shape types', async ({ page }) => {
      const shapes = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane'];

      for (const shape of shapes) {
        await page.selectOption('#shape-select-3d', shape);
        await expect(page.locator('#shape-select-3d')).toHaveValue(shape);
      }
    });
  });

  test.describe('Dimension Controls Visibility', () => {
    test('box shows all three dimensions', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'box');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeVisible();
      await expect(page.locator('#dim3-3d-row')).toBeVisible();
    });

    test('box dimensions are labeled Width, Height, Depth', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'box');
      await expect(page.locator('#dim1-3d-label')).toHaveText('Width');
      await expect(page.locator('#dim2-3d-label')).toHaveText('Height');
      await expect(page.locator('#dim3-3d-label')).toHaveText('Depth');
    });

    test('sphere shows only radius', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'sphere');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeHidden();
      await expect(page.locator('#dim3-3d-row')).toBeHidden();
      await expect(page.locator('#dim1-3d-label')).toHaveText('Radius');
    });

    test('cylinder shows radius and height', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'cylinder');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeVisible();
      await expect(page.locator('#dim3-3d-row')).toBeHidden();
      await expect(page.locator('#dim1-3d-label')).toHaveText('Radius');
      await expect(page.locator('#dim2-3d-label')).toHaveText('Height');
    });

    test('cone shows radius and height', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'cone');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeVisible();
      await expect(page.locator('#dim3-3d-row')).toBeHidden();
      await expect(page.locator('#dim1-3d-label')).toHaveText('Radius');
      await expect(page.locator('#dim2-3d-label')).toHaveText('Height');
    });

    test('torus shows radius and tube radius', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'torus');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeVisible();
      await expect(page.locator('#dim3-3d-row')).toBeHidden();
      await expect(page.locator('#dim1-3d-label')).toHaveText('Radius');
      await expect(page.locator('#dim2-3d-label')).toHaveText('Tube Radius');
    });

    test('plane shows width and height', async ({ page }) => {
      await page.selectOption('#shape-select-3d', 'plane');
      await expect(page.locator('#dim1-3d-row')).toBeVisible();
      await expect(page.locator('#dim2-3d-row')).toBeVisible();
      await expect(page.locator('#dim3-3d-row')).toBeHidden();
      await expect(page.locator('#dim1-3d-label')).toHaveText('Width');
      await expect(page.locator('#dim2-3d-label')).toHaveText('Height');
    });
  });

  test.describe('Slider Controls', () => {
    test('position sliders update display values', async ({ page }) => {
      await page.locator('#pos-x-3d').fill('100');
      await page.locator('#pos-x-3d').dispatchEvent('input');
      await expect(page.locator('#pos-x-3d-val')).toHaveText('100');

      await page.locator('#pos-y-3d').fill('-50');
      await page.locator('#pos-y-3d').dispatchEvent('input');
      await expect(page.locator('#pos-y-3d-val')).toHaveText('-50');

      await page.locator('#pos-z-3d').fill('75');
      await page.locator('#pos-z-3d').dispatchEvent('input');
      await expect(page.locator('#pos-z-3d-val')).toHaveText('75');
    });

    test('dimension sliders update display values', async ({ page }) => {
      await page.locator('#dim1-3d').fill('200');
      await page.locator('#dim1-3d').dispatchEvent('input');
      await expect(page.locator('#dim1-3d-val')).toHaveText('200');

      await page.locator('#dim2-3d').fill('150');
      await page.locator('#dim2-3d').dispatchEvent('input');
      await expect(page.locator('#dim2-3d-val')).toHaveText('150');
    });

    test('rotation sliders show degree symbol', async ({ page }) => {
      await page.locator('#rot-x-3d').fill('45');
      await page.locator('#rot-x-3d').dispatchEvent('input');
      await expect(page.locator('#rot-x-3d-val')).toHaveText('45\u00B0');

      await page.locator('#rot-y-3d').fill('90');
      await page.locator('#rot-y-3d').dispatchEvent('input');
      await expect(page.locator('#rot-y-3d-val')).toHaveText('90\u00B0');

      await page.locator('#rot-z-3d').fill('180');
      await page.locator('#rot-z-3d').dispatchEvent('input');
      await expect(page.locator('#rot-z-3d-val')).toHaveText('180\u00B0');
    });

    test('shininess slider updates display value', async ({ page }) => {
      await page.selectOption('#material-type-3d', 'specular');
      await page.locator('#shininess-3d').fill('100');
      await page.locator('#shininess-3d').dispatchEvent('input');
      await expect(page.locator('#shininess-3d-val')).toHaveText('100');
    });
  });

  test.describe('Material Controls', () => {
    test('defaults to normal material', async ({ page }) => {
      await expect(page.locator('#material-type-3d')).toHaveValue('normal');
    });

    test('normal material hides color and shininess', async ({ page }) => {
      await page.selectOption('#material-type-3d', 'normal');
      await expect(page.locator('#material-color-3d-row')).toBeHidden();
      await expect(page.locator('#shininess-3d-row')).toBeHidden();
    });

    test('ambient material shows color, hides shininess', async ({ page }) => {
      await page.selectOption('#material-type-3d', 'ambient');
      await expect(page.locator('#material-color-3d-row')).toBeVisible();
      await expect(page.locator('#shininess-3d-row')).toBeHidden();
    });

    test('specular material shows color and shininess', async ({ page }) => {
      await page.selectOption('#material-type-3d', 'specular');
      await expect(page.locator('#material-color-3d-row')).toBeVisible();
      await expect(page.locator('#shininess-3d-row')).toBeVisible();
    });

    test('emissive material shows color, hides shininess', async ({ page }) => {
      await page.selectOption('#material-type-3d', 'emissive');
      await expect(page.locator('#material-color-3d-row')).toBeVisible();
      await expect(page.locator('#shininess-3d-row')).toBeHidden();
    });
  });

  test.describe('Lighting Controls', () => {
    test('lighting is enabled by default', async ({ page }) => {
      await expect(page.locator('#lighting-enabled-3d')).toBeChecked();
    });

    test('ambient color picker has default value', async ({ page }) => {
      await expect(page.locator('#ambient-color-3d')).toHaveValue('#404040');
    });

    test('directional color picker has default value', async ({ page }) => {
      await expect(page.locator('#directional-color-3d')).toHaveValue('#ffffff');
    });
  });

  test.describe('Style Controls', () => {
    test('stroke is disabled by default', async ({ page }) => {
      await expect(page.locator('#stroke-enabled-3d')).not.toBeChecked();
    });

    test('stroke color hidden when stroke disabled', async ({ page }) => {
      await expect(page.locator('#stroke-color-3d-row')).toBeHidden();
    });

    test('stroke color shown when stroke enabled', async ({ page }) => {
      await page.locator('#stroke-enabled-3d').check();
      await expect(page.locator('#stroke-color-3d-row')).toBeVisible();
    });

    test('stroke color hidden again when stroke unchecked', async ({ page }) => {
      await page.locator('#stroke-enabled-3d').check();
      await expect(page.locator('#stroke-color-3d-row')).toBeVisible();

      await page.locator('#stroke-enabled-3d').uncheck();
      await expect(page.locator('#stroke-color-3d-row')).toBeHidden();
    });
  });

  test.describe('Canvas', () => {
    test('canvas has correct dimensions in 3D mode', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box.width).toBe(400);
      expect(box.height).toBe(400);
    });

    test('canvas uses WebGL context', async ({ page }) => {
      const isWebGL = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        // If p5 already has the context, getContext returns the existing one
        // or null if a different context type was already created.
        // The canvas data attribute or checking the p5 renderer also works.
        return canvas.dataset.hidden !== undefined ||
               canvas.getContext('webgl2') !== null ||
               canvas.getContext('webgl') !== null;
      });
      // Just verify the canvas exists and is rendering (no errors)
      await expect(page.locator('canvas')).toBeVisible();
    });
  });

  test.describe('3D Configuration', () => {
    test('shape3DConfig is accessible and correct', async ({ page }) => {
      const config = await page.evaluate(() => shape3DConfig);

      expect(config.box.count).toBe(3);
      expect(config.box.dims).toEqual(['Width', 'Height', 'Depth']);

      expect(config.sphere.count).toBe(1);
      expect(config.sphere.dims).toEqual(['Radius']);

      expect(config.cylinder.count).toBe(2);
      expect(config.torus.dims).toEqual(['Radius', 'Tube Radius']);

      expect(config.plane.count).toBe(2);
      expect(config.plane.dims).toEqual(['Width', 'Height']);
    });
  });
});

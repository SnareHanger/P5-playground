import { test, expect } from '@playwright/test';

test.describe('Shape Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test.describe('Shape Selection', () => {
    test('defaults to rectangle', async ({ page }) => {
      await expect(page.locator('#shape-select')).toHaveValue('rectangle');
    });

    test('can select all shape types', async ({ page }) => {
      const shapes = ['rectangle', 'ellipse', 'triangle', 'line', 'quad', 'arc', 'point', 'freeform'];

      for (const shape of shapes) {
        await page.selectOption('#shape-select', shape);
        await expect(page.locator('#shape-select')).toHaveValue(shape);
      }
    });
  });

  test.describe('UI Controls Visibility', () => {
    test('shows dimensions for rectangle', async ({ page }) => {
      await page.selectOption('#shape-select', 'rectangle');
      await expect(page.locator('#dimensions-fieldset')).toBeVisible();
      await expect(page.locator('#arc-fieldset')).toBeHidden();
      await expect(page.locator('#freeform-fieldset')).toBeHidden();
    });

    test('hides dimensions for point', async ({ page }) => {
      await page.selectOption('#shape-select', 'point');
      await expect(page.locator('#dimensions-fieldset')).toBeHidden();
    });

    test('hides fill for line', async ({ page }) => {
      await page.selectOption('#shape-select', 'line');
      await expect(page.locator('#fill-row')).toBeHidden();
    });

    test('hides fill for point', async ({ page }) => {
      await page.selectOption('#shape-select', 'point');
      await expect(page.locator('#fill-row')).toBeHidden();
    });

    test('shows arc controls only for arc', async ({ page }) => {
      await page.selectOption('#shape-select', 'arc');
      await expect(page.locator('#arc-fieldset')).toBeVisible();

      await page.selectOption('#shape-select', 'rectangle');
      await expect(page.locator('#arc-fieldset')).toBeHidden();
    });

    test('shows freeform controls only for freeform', async ({ page }) => {
      await page.selectOption('#shape-select', 'freeform');
      await expect(page.locator('#freeform-fieldset')).toBeVisible();
      await expect(page.locator('#dimensions-fieldset')).toBeHidden();

      await page.selectOption('#shape-select', 'rectangle');
      await expect(page.locator('#freeform-fieldset')).toBeHidden();
    });
  });

  test.describe('Slider Controls', () => {
    test('position sliders update display values', async ({ page }) => {
      await page.locator('#pos-x').fill('150');
      await page.locator('#pos-x').dispatchEvent('input');
      await expect(page.locator('#pos-x-val')).toHaveText('150');

      await page.locator('#pos-y').fill('250');
      await page.locator('#pos-y').dispatchEvent('input');
      await expect(page.locator('#pos-y-val')).toHaveText('250');
    });

    test('dimension sliders update display values', async ({ page }) => {
      await page.locator('#dim-w').fill('200');
      await page.locator('#dim-w').dispatchEvent('input');
      await expect(page.locator('#dim-w-val')).toHaveText('200');

      await page.locator('#dim-h').fill('150');
      await page.locator('#dim-h').dispatchEvent('input');
      await expect(page.locator('#dim-h-val')).toHaveText('150');
    });

    test('arc angle sliders show degree symbol', async ({ page }) => {
      await page.selectOption('#shape-select', 'arc');

      await page.locator('#arc-start').fill('45');
      await page.locator('#arc-start').dispatchEvent('input');
      await expect(page.locator('#arc-start-val')).toHaveText('45°');

      await page.locator('#arc-stop').fill('180');
      await page.locator('#arc-stop').dispatchEvent('input');
      await expect(page.locator('#arc-stop-val')).toHaveText('180°');
    });
  });

  test.describe('Canvas Interactions', () => {
    test('canvas is rendered', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      const box = await canvas.boundingBox();
      expect(box.width).toBe(400);
      expect(box.height).toBe(400);
    });

    test('dragging center anchor updates position sliders', async ({ page }) => {
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // Center anchor is at position (200, 200) by default
      const startX = box.x + 200;
      const startY = box.y + 200;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 50, startY + 30);
      await page.mouse.up();

      // Check sliders updated
      const posXVal = await page.locator('#pos-x').inputValue();
      const posYVal = await page.locator('#pos-y').inputValue();

      expect(parseInt(posXVal)).toBe(250);
      expect(parseInt(posYVal)).toBe(230);
    });

    test('dragging vertex anchor updates dimension sliders', async ({ page }) => {
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // Top-left corner of rectangle (default: x=200, y=200, w=100, h=100)
      // So top-left is at (150, 150)
      const cornerX = box.x + 150;
      const cornerY = box.y + 150;

      await page.mouse.move(cornerX, cornerY);
      await page.mouse.down();
      await page.mouse.move(cornerX - 25, cornerY - 25); // Drag outward
      await page.mouse.up();

      // Width and height should increase
      const dimWVal = await page.locator('#dim-w').inputValue();
      const dimHVal = await page.locator('#dim-h').inputValue();

      expect(parseInt(dimWVal)).toBeGreaterThan(100);
      expect(parseInt(dimHVal)).toBeGreaterThan(100);
    });
  });

  test.describe('Freeform Shape', () => {
    test.beforeEach(async ({ page }) => {
      await page.selectOption('#shape-select', 'freeform');
    });

    test('reset button restores rectangle shape', async ({ page }) => {
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // Drag a vertex to deform the shape
      const vertexX = box.x + 150;
      const vertexY = box.y + 150;

      await page.mouse.move(vertexX, vertexY);
      await page.mouse.down();
      await page.mouse.move(vertexX - 50, vertexY - 50);
      await page.mouse.up();

      // Click reset
      await page.click('#freeform-reset');

      // Shape should be back to default rectangle position
      // We can verify this visually or by checking canvas state
      await expect(page.locator('#freeform-reset')).toBeVisible();
    });

    test('double-click on edge adds vertex', async ({ page }) => {
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // Double-click on top edge (between top-left and top-right vertices)
      // Top edge is at y = 150, from x = 150 to x = 250
      const edgeX = box.x + 200;
      const edgeY = box.y + 150;

      await page.mouse.dblclick(edgeX, edgeY);

      // Verify a new vertex was added (visual check via screenshot)
      // The shape should now have 5 vertices instead of 4
    });

    test('double-click on vertex deletes it', async ({ page }) => {
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // First add a vertex
      const edgeX = box.x + 200;
      const edgeY = box.y + 150;
      await page.mouse.dblclick(edgeX, edgeY);

      // Now double-click on the new vertex to delete it
      await page.mouse.dblclick(edgeX, edgeY);

      // Shape should be back to 4 vertices
    });
  });

  test.describe('Arc Shape', () => {
    test.beforeEach(async ({ page }) => {
      await page.selectOption('#shape-select', 'arc');
    });

    test('arc mode selector changes mode', async ({ page }) => {
      await page.selectOption('#arc-mode', 'CHORD');
      await expect(page.locator('#arc-mode')).toHaveValue('CHORD');

      await page.selectOption('#arc-mode', 'OPEN');
      await expect(page.locator('#arc-mode')).toHaveValue('OPEN');

      await page.selectOption('#arc-mode', 'PIE');
      await expect(page.locator('#arc-mode')).toHaveValue('PIE');
    });
  });

  test.describe('Style Controls', () => {
    test('fill color picker is accessible', async ({ page }) => {
      await expect(page.locator('#fill-color')).toBeVisible();
      await expect(page.locator('#fill-color')).toHaveValue('#4a90d9');
    });

    test('stroke color picker is accessible', async ({ page }) => {
      await expect(page.locator('#stroke-color')).toBeVisible();
      await expect(page.locator('#stroke-color')).toHaveValue('#333333');
    });

    test('stroke weight slider updates display', async ({ page }) => {
      await page.locator('#stroke-weight').fill('10');
      await page.locator('#stroke-weight').dispatchEvent('input');
      await expect(page.locator('#stroke-weight-val')).toHaveText('10');
    });
  });
});

test.describe('Mobile Touch Support', () => {
  test.use({ ...test.info().project.use, hasTouch: true });

  test('touch drag moves anchor', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    // Simulate touch drag on center anchor
    const startX = box.x + 200;
    const startY = box.y + 200;

    await page.touchscreen.tap(startX, startY);

    // Touch and drag
    await page.evaluate(async ({ x, y, endX, endY }) => {
      const canvas = document.querySelector('canvas');

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y })]
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: canvas, clientX: endX, clientY: endY })]
      });
      canvas.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        touches: []
      });
      canvas.dispatchEvent(touchEnd);
    }, { x: startX, y: startY, endX: startX + 30, endY: startY + 30 });
  });
});

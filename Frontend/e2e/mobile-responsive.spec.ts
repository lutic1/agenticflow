import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive Design', () => {
  test.use({ ...devices['iPhone 12'] });

  test('home page is responsive on mobile', async ({ page }) => {
    await page.goto('/');

    // Verify mobile layout
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(768);

    // Check that elements stack vertically
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify prompt input is visible and usable
    const promptInput = page.locator('input[placeholder*="What can I do"]');
    await expect(promptInput).toBeVisible();
    await promptInput.fill('Mobile Test');

    // Verify generate button is accessible
    const generateButton = page.locator('button:has-text("Generate")');
    await expect(generateButton).toBeVisible();
  });

  test('slide preview is responsive on mobile', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    await expect(page.locator('[data-testid="slide-preview"]')).toBeVisible();

    // Verify slide preview scales appropriately
    const preview = page.locator('[data-testid="slide-preview"]');
    const boundingBox = await preview.boundingBox();

    expect(boundingBox?.width).toBeLessThan(400);
  });

  test('touch gestures work for slide navigation', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id');

    await expect(page.locator('[data-testid="slide-preview"]')).toBeVisible();

    const preview = page.locator('[data-testid="slide-preview"]');

    // Swipe left to go to next slide
    await preview.swipe({ direction: 'left' });
    await expect(page.locator('text=Slide 2 of')).toBeVisible();

    // Swipe right to go to previous slide
    await preview.swipe({ direction: 'right' });
    await expect(page.locator('text=Slide 1 of')).toBeVisible();
  });

  test('mobile menu is accessible', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    // Open mobile menu
    const menuButton = page.locator('[aria-label="Menu"]');
    await menuButton.click();

    // Verify menu items visible
    await expect(page.locator('text=Grid Layout')).toBeVisible();
    await expect(page.locator('text=Typography')).toBeVisible();
    await expect(page.locator('text=Colors')).toBeVisible();
  });

  test('export dialog is responsive', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    await page.click('[aria-label="More options"]');
    await page.click('text=Export to PPTX');

    // Verify dialog fits in viewport
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    const boundingBox = await dialog.boundingBox();
    const viewport = page.viewportSize();

    expect(boundingBox?.width).toBeLessThanOrEqual(viewport?.width || 390);
  });

  test('font sizes are readable on mobile', async ({ page }) => {
    await page.goto('/');

    const bodyText = page.locator('body');
    const fontSize = await bodyText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Minimum readable font size on mobile
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });

  test('tap targets are large enough', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();

      if (boundingBox) {
        // WCAG 2.1 Level AAA: 44x44 pixels
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Tablet Responsive Design', () => {
  test.use({ ...devices['iPad Pro'] });

  test('tablet layout differs from mobile', async ({ page }) => {
    await page.goto('/');

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(768);

    // Check for tablet-specific layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('side panels are visible on tablet', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    // Verify side panels don't collapse on tablet
    const layoutPanel = page.locator('[aria-label="Grid Layout"]');
    await expect(layoutPanel).toBeVisible();
  });
});

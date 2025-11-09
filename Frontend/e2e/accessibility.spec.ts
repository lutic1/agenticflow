import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('editor page should not have accessibility violations', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    await expect(page.locator('[data-testid="slide-editor"]')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('supports keyboard navigation on home page', async ({ page }) => {
    await page.goto('/');

    // Tab to prompt input
    await page.keyboard.press('Tab');
    await expect(page.locator('input[placeholder*="What can I do"]')).toBeFocused();

    // Type content
    await page.keyboard.type('AI Test');

    // Tab through template options
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-template="arctic"]')).toBeFocused();

    // Select template with Enter
    await page.keyboard.press('Enter');

    // Tab to generate button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Generate")')).toBeFocused();
  });

  test('supports keyboard navigation in editor', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    await expect(page.locator('[data-testid="slide-editor"]')).toBeVisible();

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Use arrow keys for slide navigation
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('text=Slide 2 of')).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('text=Slide 1 of')).toBeVisible();

    // Use Home/End for first/last slide
    await page.keyboard.press('End');
    await expect(page.locator('text=of 10')).toBeVisible();

    await page.keyboard.press('Home');
    await expect(page.locator('text=Slide 1 of')).toBeVisible();
  });

  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    // Check important ARIA labels
    await expect(page.locator('[aria-label="Grid Layout"]')).toBeVisible();
    await expect(page.locator('[aria-label="Typography"]')).toBeVisible();
    await expect(page.locator('[aria-label="Colors"]')).toBeVisible();
    await expect(page.locator('[aria-label="More options"]')).toBeVisible();
  });

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check h2 exists under h1
    const h2 = page.locator('h2');
    expect(await h2.count()).toBeGreaterThan(0);
  });

  test('has sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id/edit');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/');

    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('focus is visible', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');

    // Check that focused element has visible outline
    const outline = await focusedElement.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });

    expect(outline).not.toBe('none');
  });

  test('screen reader announcements for dynamic content', async ({ page }) => {
    await page.goto('/');

    // Generate presentation
    await page.fill('input[placeholder*="What can I do"]', 'Test');
    await page.click('button:has-text("Generate")');

    // Check for live region announcements
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();

    // Verify announcement content
    await expect(liveRegion).toContainText(/Generating/i);
  });
});

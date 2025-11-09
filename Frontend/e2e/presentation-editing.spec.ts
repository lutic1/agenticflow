import { test, expect } from '@playwright/test';

test.describe('Presentation Editing with P0 Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to an existing presentation editor
    await page.goto('/presentations/test-presentation-id/edit');
    await expect(page.locator('[data-testid="slide-editor"]')).toBeVisible();
  });

  test('user can change grid layout', async ({ page }) => {
    // Open grid layout panel
    await page.click('[aria-label="Grid Layout"]');

    // Wait for layout options
    await expect(page.locator('text=2 Columns')).toBeVisible();

    // Select 2-column layout
    await page.click('text=2 Columns');

    // Verify layout applied
    await expect(page.locator('text=Layout applied')).toBeVisible();

    // Verify preview updated
    await expect(page.locator('[data-testid="slide-preview"]')).toHaveClass(
      /grid-cols-2/
    );
  });

  test('user can change typography', async ({ page }) => {
    // Open typography panel
    await page.click('[aria-label="Typography"]');

    // Change font family
    await page.selectOption('select[name="fontFamily"]', 'Roboto, sans-serif');

    // Verify typography updated
    await expect(page.locator('text=Typography updated')).toBeVisible();

    // Change font size
    const sizeSlider = page.locator('input[name="fontSize"]');
    await sizeSlider.fill('24');

    // Verify preview updated
    const preview = page.locator('[data-testid="slide-preview"]');
    await expect(preview).toHaveCSS('font-family', /Roboto/);
  });

  test('user can change color palette', async ({ page }) => {
    // Open colors panel
    await page.click('[aria-label="Colors"]');

    // Wait for palettes
    await expect(page.locator('[data-testid="palette-corporate"]')).toBeVisible();

    // Select vibrant palette
    await page.click('[data-testid="palette-vibrant"]');

    // Verify palette updated
    await expect(page.locator('text=Palette updated')).toBeVisible();

    // Verify preview updated
    await expect(page.locator('[data-testid="slide-preview"]')).toHaveAttribute(
      'data-theme',
      'vibrant'
    );
  });

  test('user can apply custom colors', async ({ page }) => {
    // Open colors panel
    await page.click('[aria-label="Colors"]');

    // Click custom colors
    await page.click('button:has-text("Custom")');

    // Enter custom primary color
    const primaryInput = page.locator('input[name="primaryColor"]');
    await primaryInput.fill('#FF6B6B');

    // Enter custom background color
    const bgInput = page.locator('input[name="backgroundColor"]');
    await bgInput.fill('#FFFFFF');

    // Verify custom colors applied
    await expect(page.locator('text=Custom colors applied')).toBeVisible({
      timeout: 2000,
    });
  });

  test('user can undo and redo changes', async ({ page }) => {
    // Make a change (grid layout)
    await page.click('[aria-label="Grid Layout"]');
    await page.click('text=3 Columns');
    await expect(page.locator('text=Layout applied')).toBeVisible();

    // Undo
    await page.click('[aria-label="Undo"]');
    await expect(page.locator('[data-testid="slide-preview"]')).not.toHaveClass(
      /grid-cols-3/
    );

    // Redo
    await page.click('[aria-label="Redo"]');
    await expect(page.locator('[data-testid="slide-preview"]')).toHaveClass(
      /grid-cols-3/
    );
  });

  test('user can edit slide content inline', async ({ page }) => {
    // Click on slide title
    const title = page.locator('[data-testid="slide-title"]');
    await title.click();

    // Edit title
    await title.fill('Updated Slide Title');

    // Click outside to save
    await page.click('[data-testid="slide-preview"]');

    // Verify title saved
    await expect(page.locator('text=Slide updated')).toBeVisible();
  });

  test('user can add new slide', async ({ page }) => {
    // Click add slide button
    await page.click('button:has-text("Add Slide")');

    // Verify new slide created
    await expect(page.locator('text=Slide 11 of 11')).toBeVisible();
  });

  test('user can delete slide', async ({ page }) => {
    // Get initial slide count
    const slideCountText = await page
      .locator('text=Slide 1 of')
      .textContent();
    const match = slideCountText?.match(/of (\d+)/);
    const initialCount = match ? parseInt(match[1]) : 10;

    // Open more options
    await page.click('[aria-label="More options"]');

    // Click delete slide
    await page.click('text=Delete Slide');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify slide deleted
    await expect(page.locator(`text=of ${initialCount - 1}`)).toBeVisible();
  });

  test('user can duplicate slide', async ({ page }) => {
    // Get initial slide count
    const slideCountText = await page
      .locator('text=Slide 1 of')
      .textContent();
    const match = slideCountText?.match(/of (\d+)/);
    const initialCount = match ? parseInt(match[1]) : 10;

    // Open more options
    await page.click('[aria-label="More options"]');

    // Click duplicate slide
    await page.click('text=Duplicate Slide');

    // Verify slide duplicated
    await expect(page.locator(`text=of ${initialCount + 1}`)).toBeVisible();
  });

  test('shows accessibility warnings for poor contrast', async ({ page }) => {
    // Open colors panel
    await page.click('[aria-label="Colors"]');

    // Click custom colors
    await page.click('button:has-text("Custom")');

    // Set poor contrast colors
    await page.fill('input[name="backgroundColor"]', '#FFFFFF');
    await page.fill('input[name="textColor"]', '#F0F0F0');

    // Verify warning shown
    await expect(page.locator('text=Low contrast')).toBeVisible();
  });
});

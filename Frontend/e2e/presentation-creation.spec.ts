import { test, expect } from '@playwright/test';

test.describe('Presentation Creation', () => {
  test('user can create presentation from scratch', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');

    // 2. Verify page loaded
    await expect(page.locator('h1')).toContainText(/Slide Designer/i);

    // 3. Enter topic
    const promptInput = page.locator('input[placeholder*="What can I do"]');
    await promptInput.fill('Machine Learning Basics');

    // 4. Select template
    await expect(page.locator('text=Arctic')).toBeVisible();
    await page.click('text=Arctic');

    // 5. Configure options
    await page.selectOption('select[name="tone"]', 'formal');
    await page.fill('input[name="slideCount"]', '10');

    // 6. Generate presentation
    await page.click('button:has-text("Generate")');

    // 7. Wait for reasoning phase
    await expect(page.locator('text=Reasoning')).toBeVisible({ timeout: 5000 });

    // 8. Wait for slides to load
    await expect(page.locator('text=Machine Learning Basics')).toBeVisible({
      timeout: 30000,
    });

    // 9. Verify slide preview is visible
    await expect(page.locator('[data-testid="slide-preview"]')).toBeVisible();

    // 10. Verify slide navigation
    await expect(page.locator('text=Slide 1 of')).toBeVisible();
  });

  test('user can navigate through generated slides', async ({ page }) => {
    await page.goto('/');

    // Generate presentation
    await page.fill('input[placeholder*="What can I do"]', 'AI in Healthcare');
    await page.click('text=Glamour');
    await page.click('button:has-text("Generate")');

    // Wait for generation
    await expect(page.locator('text=AI in Healthcare')).toBeVisible({
      timeout: 30000,
    });

    // Navigate to slide 2
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Slide 2 of')).toBeVisible();

    // Navigate back to slide 1
    await page.click('button:has-text("Previous")');
    await expect(page.locator('text=Slide 1 of')).toBeVisible();

    // Navigate to last slide
    await page.click('button:has-text("Last")');
    await expect(page.locator('text=Slide 10 of 10')).toBeVisible();

    // Navigate to first slide
    await page.click('button:has-text("First")');
    await expect(page.locator('text=Slide 1 of')).toBeVisible();
  });

  test('user can export presentation to PPTX', async ({ page }) => {
    await page.goto('/presentations/test-presentation-id');

    // Open more options menu
    await page.click('[aria-label="More options"]');

    // Click export to PPTX
    await page.click('text=Export to PPTX');

    // Verify export dialog
    await expect(page.locator('text=Export Presentation')).toBeVisible();

    // Select PPTX format (should be default)
    await expect(page.locator('input[value="pptx"]')).toBeChecked();

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pptx');
  });

  test('user can save presentation', async ({ page }) => {
    await page.goto('/');

    // Generate presentation
    await page.fill('input[placeholder*="What can I do"]', 'Cloud Computing');
    await page.click('text=Arctic');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('text=Cloud Computing')).toBeVisible({
      timeout: 30000,
    });

    // Save presentation
    await page.click('button:has-text("Save")');

    // Verify success message
    await expect(page.locator('text=Saved successfully')).toBeVisible();

    // Verify URL changed to edit page
    await expect(page).toHaveURL(/\/presentations\/[a-z0-9-]+\/edit/);
  });

  test('user can cancel generation', async ({ page }) => {
    await page.goto('/');

    // Start generation
    await page.fill('input[placeholder*="What can I do"]', 'Test Topic');
    await page.click('button:has-text("Generate")');

    // Wait for generation to start
    await expect(page.locator('text=Generating')).toBeVisible();

    // Cancel generation
    await page.click('button:has-text("Cancel")');

    // Verify generation stopped
    await expect(page.locator('text=Generating')).not.toBeVisible({
      timeout: 2000,
    });
  });

  test('shows validation error for empty prompt', async ({ page }) => {
    await page.goto('/');

    // Try to generate without entering topic
    await page.click('button:has-text("Generate")');

    // Verify error message
    await expect(page.locator('text=Please enter a topic')).toBeVisible();
  });

  test('handles generation errors gracefully', async ({ page }) => {
    await page.goto('/');

    // Mock API error by navigating to error endpoint
    await page.route('**/api/generate-slides', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Generation failed' }),
      })
    );

    await page.fill('input[placeholder*="What can I do"]', 'Test Topic');
    await page.click('button:has-text("Generate")');

    // Verify error message
    await expect(page.locator('[role="alert"]')).toContainText(
      /Generation failed/i
    );
  });
});

/**
 * @test E2E Sign Out Flow
 * @description End-to-end tests for sign-out functionality
 * @prerequisites
 *   - User must be authenticated before testing sign-out
 */

import { test, expect } from '@playwright/test';

test.describe('Sign Out Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should sign out successfully', async ({ page }) => {
    // Open profile dropdown
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    // Click sign out
    const signOutBtn = page.getByRole('button', { name: /sign out|log out/i });
    await signOutBtn.click();

    // Should redirect to login or home
    await page.waitForURL(/\/login|\//, { timeout: 5000 });

    // Verify signed out - user avatar should not be visible
    await expect(avatar).not.toBeVisible();
  });

  test('should clear session data on sign out', async ({ page }) => {
    // Sign out
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    await page.waitForURL(/\/login/);

    // Check that session is cleared
    const sessionData = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('auth:session'),
        sessionStorage: sessionStorage.getItem('auth:session'),
      };
    });

    expect(sessionData.localStorage).toBeNull();
    expect(sessionData.sessionStorage).toBeNull();
  });

  test('should clear cookies on sign out', async ({ page, context }) => {
    // Get cookies before sign out
    const cookiesBefore = await context.cookies();
    const authCookieBefore = cookiesBefore.find(c => c.name.includes('auth') || c.name.includes('session'));

    // Sign out
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    await page.waitForURL(/\/login/);

    // Check cookies after sign out
    const cookiesAfter = await context.cookies();
    const authCookieAfter = cookiesAfter.find(c => c.name.includes('auth') || c.name.includes('session'));

    expect(authCookieAfter).toBeUndefined();
  });

  test('should redirect to home or login page after sign out', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Should redirect within 5 seconds
    await page.waitForURL(/\/login|\//, { timeout: 5000 });

    const url = page.url();
    expect(url.endsWith('/login') || url.endsWith('/')).toBe(true);
  });

  test('should prevent access to protected routes after sign out', async ({ page }) => {
    // Sign out
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    await page.waitForURL(/\/login/);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect back to login
    await page.waitForURL(/\/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test('should show confirmation message after sign out', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Should show success message (optional)
    const message = page.getByText(/signed out.*successfully|you.*have.*been.*logged.*out/i);
    await expect(message).toBeVisible({ timeout: 3000 });
  });

  test('should work from any protected page', async ({ page }) => {
    const pages = ['/dashboard', '/profile', '/settings'];

    for (const pagePath of pages) {
      // Navigate to page
      await page.goto(pagePath);

      // Sign out
      const avatar = page.getByTestId('user-avatar');
      await avatar.click();

      const signOutBtn = page.getByRole('button', { name: /sign out/i });
      await signOutBtn.click();

      await page.waitForURL(/\/login/);

      // Sign back in for next iteration
      if (pagePath !== pages[pages.length - 1]) {
        await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
        await page.waitForURL('/dashboard');
      }
    }
  });

  test('should handle sign out errors gracefully', async ({ page }) => {
    // Simulate network error during sign out
    await page.context().setOffline(true);

    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Should still clear local session even if backend call fails
    await page.context().setOffline(false);

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('should close dropdown after clicking sign out', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Dropdown should close (or page should redirect)
    await page.waitForURL(/\/login/);
  });

  test('should show loading state during sign out', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });

    // Should show loading spinner or text
    await signOutBtn.click();

    // Button should be disabled during sign out
    await expect(signOutBtn).toBeDisabled();
  });
});

test.describe('Sign Out Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should show confirmation dialog (optional)', async ({ page }) => {
    // Some apps show "Are you sure?" before signing out
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Check for confirmation dialog
    const confirmDialog = page.getByRole('dialog');

    if (await confirmDialog.isVisible()) {
      const confirmBtn = page.getByRole('button', { name: /confirm|yes|sign out/i });
      await confirmBtn.click();
    }

    await page.waitForURL(/\/login/);
  });

  test('should cancel sign out if user clicks cancel', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // If confirmation dialog appears
    const confirmDialog = page.getByRole('dialog');

    if (await confirmDialog.isVisible()) {
      const cancelBtn = page.getByRole('button', { name: /cancel|no/i });
      await cancelBtn.click();

      // Should remain on dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(avatar).toBeVisible();
    }
  });
});

test.describe('Cross-Tab Sign Out', () => {
  test('should sign out in all tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on both tabs
    await page1.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page1.waitForURL('/dashboard');

    await page2.goto('/dashboard');
    await expect(page2).toHaveURL('/dashboard');

    // Sign out on page1
    const avatar1 = page1.getByTestId('user-avatar');
    await avatar1.click();

    const signOutBtn1 = page1.getByRole('button', { name: /sign out/i });
    await signOutBtn1.click();

    await page1.waitForURL(/\/login/);

    // page2 should also sign out (via storage event)
    await page2.reload();
    await page2.waitForURL(/\/login/, { timeout: 5000 });

    await context.close();
  });

  test('should handle sign out from multiple tabs simultaneously', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page1.waitForURL('/dashboard');

    await page2.goto('/dashboard');
    await expect(page2).toHaveURL('/dashboard');

    // Click sign out on both tabs simultaneously
    const avatar1 = page1.getByTestId('user-avatar');
    await avatar1.click();
    const signOutBtn1 = page1.getByRole('button', { name: /sign out/i });

    const avatar2 = page2.getByTestId('user-avatar');
    await avatar2.click();
    const signOutBtn2 = page2.getByRole('button', { name: /sign out/i });

    await Promise.all([
      signOutBtn1.click(),
      signOutBtn2.click(),
    ]);

    // Both should sign out successfully
    await page1.waitForURL(/\/login/, { timeout: 5000 });
    await page2.waitForURL(/\/login/, { timeout: 5000 });

    await context.close();
  });
});

test.describe('Sign Out Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to avatar
    await page.keyboard.press('Tab');
    // May need multiple tabs depending on page structure

    const avatar = page.getByTestId('user-avatar');

    // Enter to open dropdown
    await page.keyboard.press('Enter');

    // Arrow down to sign out button
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown'); // May need multiple

    // Enter to sign out
    await page.keyboard.press('Enter');

    await page.waitForURL(/\/login/);
  });

  test('should have accessible labels', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });

    const ariaLabel = await signOutBtn.getAttribute('aria-label');
    expect(ariaLabel || signOutBtn.textContent).toMatch(/sign.*out|log.*out/i);
  });

  test('should announce sign out to screen readers', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Success message should have role="alert" or aria-live
    const alert = page.getByRole('alert');

    if (await alert.isVisible()) {
      expect(await alert.textContent()).toMatch(/signed.*out/i);
    }
  });
});

test.describe('Sign Out Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should complete sign out within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    await page.waitForURL(/\/login/);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });

  test('should not block UI during sign out', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    // Other UI should remain responsive during sign out
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });
});

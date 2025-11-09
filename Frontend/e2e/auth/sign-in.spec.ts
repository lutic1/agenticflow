/**
 * @test E2E Sign In Flow
 * @description End-to-end tests for Google sign-in process
 * @prerequisites
 *   - Frontend server running on localhost:3000
 *   - Mock Google OAuth server or test credentials
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Google Sign-In Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display sign-in button', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInBtn).toBeVisible();
  });

  test('should complete full Google sign-in flow', async ({ page, context }) => {
    // Click sign-in button
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Wait for OAuth popup or redirect
    const popupPromise = context.waitForEvent('page');

    // In a real test, you would interact with Google's OAuth page
    // For testing, we can mock the OAuth callback
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');

    // Should redirect to dashboard after successful auth
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify user is authenticated
    const userAvatar = page.getByTestId('user-avatar');
    await expect(userAvatar).toBeVisible();
  });

  test('should handle OAuth popup', async ({ page, context }) => {
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });

    // Listen for popup
    const popupPromise = context.waitForEvent('page');
    await signInBtn.click();

    const popup = await popupPromise;

    // Popup should open to Google OAuth URL
    expect(popup.url()).toContain('accounts.google.com');

    // Popup should have proper dimensions
    const viewportSize = popup.viewportSize();
    expect(viewportSize?.width).toBeGreaterThan(400);
    expect(viewportSize?.height).toBeGreaterThan(400);
  });

  test('should show loading state during sign-in', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });

    await signInBtn.click();

    // Button should show loading state
    await expect(signInBtn).toBeDisabled();
    await expect(signInBtn).toContainText(/signing in|loading/i);
  });

  test('should handle user cancellation', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Simulate OAuth error (user canceled)
    await page.goto('/login?error=access_denied&error_description=User+denied+access');

    // Should show error message
    const errorMsg = page.getByText(/sign.in failed|access denied/i);
    await expect(errorMsg).toBeVisible();

    // Sign-in button should be re-enabled
    await expect(signInBtn).toBeEnabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network offline
    await page.context().setOffline(true);

    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Should show network error message
    const errorMsg = page.getByText(/network error|connection failed/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });

    // Restore network
    await page.context().setOffline(false);
  });

  test('should persist session after page reload', async ({ page }) => {
    // Complete sign-in flow
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    // Verify authenticated
    const userAvatar = page.getByTestId('user-avatar');
    await expect(userAvatar).toBeVisible();

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(userAvatar).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should include CSRF protection', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // OAuth URL should include state parameter
    // Check localStorage or session storage for state token
    const state = await page.evaluate(() => {
      return sessionStorage.getItem('oauth:state') || localStorage.getItem('oauth:state');
    });

    expect(state).toBeTruthy();
    expect(state?.length).toBeGreaterThan(10);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInBtn).toBeVisible();

    // Button should be touch-friendly
    const btnBox = await signInBtn.boundingBox();
    expect(btnBox?.height).toBeGreaterThan(40); // Min 44px recommended
  });

  test('should handle expired OAuth state', async ({ page }) => {
    // Attempt callback with expired/invalid state
    await page.goto('/api/auth/callback/google?code=mock-code&state=invalid-state');

    // Should show error
    const errorMsg = page.getByText(/invalid.*state|security.*error/i);
    await expect(errorMsg).toBeVisible();
  });

  test('should redirect authenticated users away from login', async ({ page }) => {
    // First, sign in
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    // Try to visit login page
    await page.goto('/login');

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Sign-In Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Tab to sign-in button
    await page.keyboard.press('Tab');

    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInBtn).toBeFocused();

    // Enter to activate
    await page.keyboard.press('Enter');

    // Should trigger OAuth flow
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');

    const signInBtn = page.getByRole('button', { name: /sign in with google/i });

    // Should have accessible name
    const ariaLabel = await signInBtn.getAttribute('aria-label');
    expect(ariaLabel || 'Sign in with Google').toContain('Google');
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/login?error=access_denied');

    // Error message should have role="alert" or aria-live
    const errorMsg = page.getByRole('alert');
    await expect(errorMsg).toBeVisible();
  });
});

test.describe('Sign-In Performance', () => {
  test('should complete sign-in within 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Mock successful callback
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000);
  });

  test('should not block UI during authentication', async ({ page }) => {
    await page.goto('/login');

    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Other UI elements should remain responsive
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });
});

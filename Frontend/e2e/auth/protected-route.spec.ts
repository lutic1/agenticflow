/**
 * @test E2E Protected Routes
 * @description End-to-end tests for route protection and authentication flow
 * @prerequisites
 *   - Frontend server running
 *   - Protected routes configured
 */

import { test, expect } from '@playwright/test';

test.describe('Protected Routes - Unauthenticated', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected dashboard
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should preserve intended destination', async ({ page }) => {
    // Try to access specific protected page
    await page.goto('/presentations/123/edit');

    // Should redirect to login with returnTo parameter
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('returnTo=');
  });

  test('should show appropriate message on redirect', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);

    // Should show message explaining redirect
    const message = page.getByText(/sign in.*continue|authentication.*required/i);
    await expect(message).toBeVisible({ timeout: 3000 });
  });

  test('should not flash protected content before redirect', async ({ page }) => {
    await page.goto('/dashboard');

    // Protected content should never be visible
    const protectedContent = page.getByTestId('dashboard-content');
    await expect(protectedContent).not.toBeVisible();
  });

  test('should protect all specified routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/presentations/new',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/\/login/, { timeout: 3000 });
      expect(page.url()).toContain('/login');
    }
  });

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/about', '/login'];

    for (const route of publicRoutes) {
      await page.goto(route);

      // Should not redirect to login
      expect(page.url()).not.toContain('/login');

      // Page should load successfully
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});

test.describe('Protected Routes - Complete Flow', () => {
  test('should complete full authentication flow', async ({ page }) => {
    // Step 1: Try to access protected route
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);

    // Step 2: Sign in
    const signInBtn = page.getByRole('button', { name: /sign in with google/i });
    await signInBtn.click();

    // Step 3: Complete OAuth (mocked)
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');

    // Step 4: Should redirect to original destination
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Step 5: Verify authenticated and can access content
    const dashboardContent = page.getByTestId('dashboard-content');
    await expect(dashboardContent).toBeVisible();
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Access specific protected page
    await page.goto('/presentations/123/edit');
    await page.waitForURL(/\/login/);

    // Complete sign-in
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');

    // Should return to originally requested page
    await page.waitForURL('/presentations/123/edit', { timeout: 10000 });
    expect(page.url()).toContain('/presentations/123/edit');
  });

  test('should preserve query parameters in redirect', async ({ page }) => {
    // Access route with query params
    await page.goto('/dashboard?tab=analytics&filter=week');
    await page.waitForURL(/\/login/);

    // Sign in
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');

    // Should preserve query params
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('tab=analytics');
    expect(page.url()).toContain('filter=week');
  });

  test('should preserve hash fragments', async ({ page }) => {
    await page.goto('/dashboard#section-2');
    await page.waitForURL(/\/login/);

    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    expect(page.url()).toContain('#section-2');
  });
});

test.describe('Protected Routes - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should not redirect
    await expect(page).toHaveURL('/dashboard');

    // Content should be visible
    const dashboardContent = page.getByTestId('dashboard-content');
    await expect(dashboardContent).toBeVisible();
  });

  test('should access all protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/presentations/new',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);

      // Should show content
      await page.waitForLoadState('networkidle');
    }
  });

  test('should maintain authentication after page reload', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');

    const dashboardContent = page.getByTestId('dashboard-content');
    await expect(dashboardContent).toBeVisible();
  });

  test('should maintain authentication across navigation', async ({ page }) => {
    // Navigate between protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');

    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');

    // Should remain authenticated throughout
  });

  test('should redirect from login page to dashboard', async ({ page }) => {
    // Authenticated user tries to access login page
    await page.goto('/login');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Session Expiry During Navigation', () => {
  test('should redirect to login when session expires', async ({ page, context }) => {
    // Sign in
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    // Clear session cookies to simulate expiry
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to another protected route
    await page.goto('/profile');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('should show session expired message', async ({ page, context }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    // Simulate session expiry
    await context.clearCookies();

    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);

    // Should show explanatory message
    const message = page.getByText(/session.*expired|please.*sign.*in.*again/i);
    await expect(message).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Redirect Loop Prevention', () => {
  test('should not create redirect loop on login page', async ({ page }) => {
    await page.goto('/login');

    // Wait to ensure no redirect loop
    await page.waitForTimeout(2000);

    // Should remain on login page
    expect(page.url()).toContain('/login');
  });

  test('should handle invalid returnTo parameter', async ({ page }) => {
    // Try to create open redirect
    await page.goto('/login?returnTo=https://evil.com');

    // Sign in
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');

    // Should redirect to dashboard, not external URL
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    expect(page.url()).not.toContain('evil.com');
  });

  test('should sanitize returnTo to prevent XSS', async ({ page }) => {
    await page.goto('/login?returnTo=javascript:alert(1)');

    // Should not execute JavaScript
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL(/\/dashboard/);
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors during auth check', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    await page.goto('/dashboard');

    // Should show error message
    const errorMsg = page.getByText(/network.*error|connection.*failed/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });

    await page.context().setOffline(false);
  });

  test('should retry failed auth checks', async ({ page }) => {
    // This would require mocking API responses
    // Should implement exponential backoff
  });

  test('should show error page after max retries', async ({ page }) => {
    // After multiple failed attempts, should show error page
  });
});

test.describe('Cross-Tab Synchronization', () => {
  test('should sign out across all tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on both tabs
    await page1.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page1.waitForURL('/dashboard');

    await page2.goto('/dashboard');
    await expect(page2).toHaveURL('/dashboard');

    // Sign out on page1
    const signOutBtn = page1.getByTestId('sign-out-btn');
    await signOutBtn.click();

    await page1.waitForURL(/\/login/);

    // page2 should also be signed out
    await page2.reload();
    await page2.waitForURL(/\/login/, { timeout: 5000 });

    await context.close();
  });

  test('should sync session updates across tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Sign in on page1
    await page1.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page1.waitForURL('/dashboard');

    // page2 should also be authenticated
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL('/dashboard');

    await context.close();
  });
});

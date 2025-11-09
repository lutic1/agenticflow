/**
 * @test E2E Profile Dropdown
 * @description End-to-end tests for profile dropdown component
 * @prerequisites User must be authenticated
 */

import { test, expect } from '@playwright/test';

test.describe('Profile Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display user avatar', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await expect(avatar).toBeVisible();
  });

  test('should show user avatar image', async ({ page }) => {
    const avatarImg = page.getByAltText(/profile|avatar/i);
    await expect(avatarImg).toBeVisible();

    const src = await avatarImg.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('should show initials when no image available', async ({ page }) => {
    // This test assumes user has no profile image
    // Should show initials instead (e.g., "JD" for "John Doe")

    const avatar = page.getByTestId('user-avatar');
    const text = await avatar.textContent();

    // Should show 1-2 letter initials
    if (text) {
      expect(text.length).toBeLessThanOrEqual(2);
      expect(text).toMatch(/^[A-Z]{1,2}$/);
    }
  });

  test('should open dropdown on click', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();
  });

  test('should close dropdown on outside click', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();

    // Click outside
    await page.click('body', { position: { x: 10, y: 10 } });

    await expect(dropdown).not.toBeVisible();
  });

  test('should close dropdown on escape key', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dropdown).not.toBeVisible();
  });

  test('should toggle dropdown on repeated clicks', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    const dropdown = page.getByTestId('profile-dropdown-menu');

    // First click - open
    await avatar.click();
    await expect(dropdown).toBeVisible();

    // Second click - close
    await avatar.click();
    await expect(dropdown).not.toBeVisible();

    // Third click - open again
    await avatar.click();
    await expect(dropdown).toBeVisible();
  });
});

test.describe('Dropdown Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    // Open dropdown
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();
  });

  test('should display user name', async ({ page }) => {
    const dropdown = page.getByTestId('profile-dropdown-menu');

    // Should show user's name
    const userName = dropdown.getByText(/john doe|test user/i);
    await expect(userName).toBeVisible();
  });

  test('should display user email', async ({ page }) => {
    const dropdown = page.getByTestId('profile-dropdown-menu');

    // Should show user's email
    const userEmail = dropdown.getByText(/@.*\.com/);
    await expect(userEmail).toBeVisible();
  });

  test('should show profile link', async ({ page }) => {
    const profileLink = page.getByRole('link', { name: /profile/i });
    await expect(profileLink).toBeVisible();

    const href = await profileLink.getAttribute('href');
    expect(href).toBe('/profile');
  });

  test('should show settings link', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();

    const href = await settingsLink.getAttribute('href');
    expect(href).toBe('/settings');
  });

  test('should show sign out button', async ({ page }) => {
    const signOutBtn = page.getByRole('button', { name: /sign out|log out/i });
    await expect(signOutBtn).toBeVisible();
  });

  test('should have visual separators between sections', async ({ page }) => {
    // Dropdown should have dividers for better organization
    const dropdown = page.getByTestId('profile-dropdown-menu');

    // Check for separator elements
    const separators = dropdown.locator('[role="separator"], hr, .divider');
    const count = await separators.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Dropdown Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');

    const avatar = page.getByTestId('user-avatar');
    await avatar.click();
  });

  test('should navigate to profile page', async ({ page }) => {
    const profileLink = page.getByRole('link', { name: /profile/i });
    await profileLink.click();

    await page.waitForURL('/profile', { timeout: 3000 });
    expect(page.url()).toContain('/profile');
  });

  test('should navigate to settings page', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await settingsLink.click();

    await page.waitForURL('/settings', { timeout: 3000 });
    expect(page.url()).toContain('/settings');
  });

  test('should close dropdown after navigation', async ({ page }) => {
    const profileLink = page.getByRole('link', { name: /profile/i });
    await profileLink.click();

    await page.waitForURL('/profile');

    // Dropdown should close
    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).not.toBeVisible();
  });

  test('should sign out when sign out button is clicked', async ({ page }) => {
    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    await signOutBtn.click();

    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should open dropdown with Enter key', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');

    // Focus on avatar (may need to tab to it)
    await avatar.focus();

    // Press Enter to open
    await page.keyboard.press('Enter');

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();
  });

  test('should navigate menu items with arrow keys', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    // Arrow down should move to first menu item
    await page.keyboard.press('ArrowDown');

    const profileLink = page.getByRole('link', { name: /profile/i });
    await expect(profileLink).toBeFocused();

    // Arrow down should move to next item
    await page.keyboard.press('ArrowDown');

    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeFocused();
  });

  test('should wrap navigation at bottom', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    // Navigate to last item
    await page.keyboard.press('ArrowDown'); // Profile
    await page.keyboard.press('ArrowDown'); // Settings
    await page.keyboard.press('ArrowDown'); // Sign out

    // Arrow down again should wrap to first item
    await page.keyboard.press('ArrowDown');

    const profileLink = page.getByRole('link', { name: /profile/i });
    await expect(profileLink).toBeFocused();
  });

  test('should activate menu item with Enter', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    // Navigate to profile
    await page.keyboard.press('ArrowDown');

    // Activate with Enter
    await page.keyboard.press('Enter');

    await page.waitForURL('/profile', { timeout: 3000 });
  });

  test('should close dropdown with Escape', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dropdown).not.toBeVisible();
  });

  test('should return focus to trigger after closing', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    await page.keyboard.press('Escape');

    // Focus should return to avatar button
    await expect(avatar).toBeFocused();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should have proper ARIA attributes on trigger', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');

    const ariaHasPopup = await avatar.getAttribute('aria-haspopup');
    expect(ariaHasPopup).toBe('true');

    const ariaExpanded = await avatar.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('false');
  });

  test('should update aria-expanded when opened', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const ariaExpanded = await avatar.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('true');
  });

  test('should have accessible menu role', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    const role = await dropdown.getAttribute('role');

    expect(role).toBe('menu');
  });

  test('should have accessible labels for all items', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const profileLink = page.getByRole('link', { name: /profile/i });
    expect(await profileLink.textContent()).toBeTruthy();

    const settingsLink = page.getByRole('link', { name: /settings/i });
    expect(await settingsLink.textContent()).toBeTruthy();

    const signOutBtn = page.getByRole('button', { name: /sign out/i });
    expect(await signOutBtn.textContent()).toBeTruthy();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should render correctly on mobile', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await expect(avatar).toBeVisible();

    // Avatar should be touch-friendly size
    const box = await avatar.boundingBox();
    expect(box?.width).toBeGreaterThan(40);
    expect(box?.height).toBeGreaterThan(40);
  });

  test('should open dropdown on mobile', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const dropdown = page.getByTestId('profile-dropdown-menu');
    await expect(dropdown).toBeVisible();
  });

  test('should have touch-friendly menu items', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const profileLink = page.getByRole('link', { name: /profile/i });
    const box = await profileLink.boundingBox();

    // Should be at least 44px height (iOS/WCAG recommendation)
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Visual Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/auth/callback/google?code=mock-auth-code&state=mock-state');
    await page.waitForURL('/dashboard');
  });

  test('should show hover state on avatar', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');

    await avatar.hover();

    // Avatar should have hover styling (cursor pointer, opacity change, etc.)
    const cursor = await avatar.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  });

  test('should show hover state on menu items', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.click();

    const profileLink = page.getByRole('link', { name: /profile/i });
    await profileLink.hover();

    // Should have visible hover state
    const cursor = await profileLink.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  });

  test('should show focus state for keyboard users', async ({ page }) => {
    const avatar = page.getByTestId('user-avatar');
    await avatar.focus();

    // Should have visible focus indicator
    await expect(avatar).toBeFocused();
  });
});

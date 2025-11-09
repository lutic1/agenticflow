/**
 * @test ProfileDropdown Component
 * @description Tests for user profile dropdown menu
 * @prerequisites AuthProvider with active session
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithAuth, createMockSession } from './helpers/auth-test-utils';
import { testUsers } from './fixtures/users';

// Mock ProfileDropdown component
const MockProfileDropdown: React.FC = () => {
  return (
    <div data-testid="profile-dropdown">
      <button data-testid="profile-trigger">
        <img src="avatar.jpg" alt="Profile" />
      </button>
      <div data-testid="dropdown-menu" hidden>
        <a href="/profile">Profile</a>
        <a href="/settings">Settings</a>
        <button data-testid="sign-out-btn">Sign Out</button>
      </div>
    </div>
  );
};

describe('ProfileDropdown Component', () => {
  describe('Rendering', () => {
    it('should not render when user is not authenticated', () => {
      renderWithAuth(<MockProfileDropdown />, { session: null });

      // Should not show profile dropdown without session
      // Or should show sign-in button instead
    });

    it('should render user avatar when authenticated', () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const avatar = screen.getByRole('img', { name: /profile/i });
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', testUsers.john.image);
    });

    it('should show user initials when no image available', () => {
      const session = createMockSession({ user: testUsers.noImage });

      renderWithAuth(<MockProfileDropdown />, { session });

      // Should show initials (e.g., "NU" for "No Image User")
      const initials = screen.getByText(/NU/i);
      expect(initials).toBeInTheDocument();
    });

    it('should display user name and email', () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      // Click to open dropdown
      const trigger = screen.getByTestId('profile-trigger');
      fireEvent.click(trigger);

      expect(screen.getByText(testUsers.john.name)).toBeInTheDocument();
      expect(screen.getByText(testUsers.john.email)).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      const menu = screen.getByTestId('dropdown-menu');
      expect(menu).toBeVisible();
    });

    it('should close dropdown when clicked outside', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(
        <div>
          <MockProfileDropdown />
          <div data-testid="outside">Outside</div>
        </div>,
        { session }
      );

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      expect(screen.getByTestId('dropdown-menu')).toBeVisible();

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      expect(screen.getByTestId('dropdown-menu')).not.toBeVisible();
    });

    it('should close dropdown on escape key', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      await user.keyboard('{Escape}');

      expect(screen.getByTestId('dropdown-menu')).not.toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');

      // Tab to trigger
      await user.tab();
      expect(trigger).toHaveFocus();

      // Enter to open
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('dropdown-menu')).toBeVisible();

      // Arrow down to navigate items
      await user.keyboard('{ArrowDown}');
      const firstItem = screen.getByText('Profile');
      expect(firstItem).toHaveFocus();
    });
  });

  describe('Menu Items', () => {
    it('should show profile link', async () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      fireEvent.click(trigger);

      const profileLink = screen.getByText('Profile');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('should show settings link', async () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      fireEvent.click(trigger);

      const settingsLink = screen.getByText('Settings');
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('should show sign out button', async () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      fireEvent.click(trigger);

      const signOutBtn = screen.getByTestId('sign-out-btn');
      expect(signOutBtn).toBeInTheDocument();
    });

    it('should show optional dividers between sections', () => {
      // Menu should be organized with dividers
      // e.g., User info | Profile/Settings | Sign out
    });
  });

  describe('Sign Out Action', () => {
    it('should call signOut when sign out is clicked', async () => {
      const user = userEvent.setup();
      const mockSignOut = jest.fn();
      const session = createMockSession({ user: testUsers.john });

      // Mock useAuth to track signOut call
      // renderWithAuth with custom signOut

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      const signOutBtn = screen.getByTestId('sign-out-btn');
      await user.click(signOutBtn);

      // expect(mockSignOut).toHaveBeenCalled();
    });

    it('should show confirmation dialog for sign out (optional)', async () => {
      // Some apps show "Are you sure?" before sign out
    });

    it('should close dropdown after sign out', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      const signOutBtn = screen.getByTestId('sign-out-btn');
      await user.click(signOutBtn);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).not.toBeVisible();
      });
    });

    it('should handle sign out errors gracefully', async () => {
      // If sign out fails, should show error
      // Should not leave UI in broken state
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');

      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have accessible labels', () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');
      expect(trigger).toHaveAccessibleName();
    });

    it('should trap focus within dropdown when open', async () => {
      // Focus should cycle within dropdown
      // Should not escape to page content
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during sign out', async () => {
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      // Click sign out
      // Should show loading indicator
    });

    it('should disable actions during loading', () => {
      // Sign out button should be disabled while loading
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long user names', () => {
      const longName = 'A'.repeat(100);
      const session = createMockSession({
        user: { ...testUsers.john, name: longName },
      });

      renderWithAuth(<MockProfileDropdown />, { session });

      // Should truncate or wrap appropriately
    });

    it('should handle missing user data gracefully', () => {
      const session = createMockSession({
        user: { id: '123', email: '', name: '' },
      });

      renderWithAuth(<MockProfileDropdown />, { session });

      // Should not crash, should show fallback
    });

    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      const session = createMockSession({ user: testUsers.john });

      renderWithAuth(<MockProfileDropdown />, { session });

      const trigger = screen.getByTestId('profile-trigger');

      // Rapid clicking should not break state
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should be in a valid state
    });
  });
});

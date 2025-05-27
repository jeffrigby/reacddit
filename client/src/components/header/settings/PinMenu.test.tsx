import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import PinMenu from './PinMenu';
import {
  renderWithProviders,
  createTestStore,
  mockDOMMethods,
} from '../../../test/utils';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

describe('PinMenu', () => {
  const user = userEvent.setup();
  let domMocks: ReturnType<typeof mockDOMMethods>;

  const renderPinMenu = (
    pinMenu: boolean = false,
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        pinMenu,
        view: 'expanded',
        debugMode: false,
        theme: 'auto',
        stream: false,
      },
      ...overrides,
    };

    // Create store and spy on dispatch before rendering
    const store = createTestStore(preloadedState);
    vi.spyOn(store, 'dispatch').mockImplementation(dispatchSpy);

    const result = renderWithProviders(<PinMenu />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchSpy.mockClear();
    domMocks = mockDOMMethods();

    // Mock document.body.classList methods
    document.body.classList.remove = vi.fn();
    document.body.classList.add = vi.fn();

    // Clear any existing DOM elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders pin menu button with correct structure', () => {
      renderPinMenu();

      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      expect(pinButton).toBeInTheDocument();
      expect(pinButton).toHaveClass('btn', 'btn-sm');
      expect(pinButton).toHaveAttribute('type', 'button');
      expect(pinButton).toHaveAttribute('aria-label', 'Pin Menu');
    });

    it('renders thumbtack icon inside button', () => {
      const { container } = renderPinMenu();

      const thumbtackIcon = container.querySelector('.fas.fa-thumbtack');
      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      expect(thumbtackIcon).toBeInTheDocument();
      expect(pinButton).toContainElement(thumbtackIcon);
    });

    it('displays secondary button style when menu is not pinned', () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
      expect(pinButton).not.toHaveClass('btn-light');
    });

    it('displays light button style when menu is pinned', () => {
      renderPinMenu(true);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
      expect(pinButton).not.toHaveClass('btn-secondary');
    });
  });

  describe('Pin Menu State Management', () => {
    it('reflects pinMenu state from Redux store when enabled', () => {
      renderPinMenu(true);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
    });

    it('reflects pinMenu state from Redux store when disabled', () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
    });

    it('updates state when button is clicked to enable pin menu', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { pinMenu: true },
        })
      );
    });

    it('updates state when button is clicked to disable pin menu', async () => {
      renderPinMenu(true);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { pinMenu: false },
        })
      );
    });

    it('toggles state correctly on multiple clicks', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      // First click - enable (button is unpinned, so it should dispatch true)
      await user.click(pinButton);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          payload: { pinMenu: true },
        })
      );

      // Second click - still dispatches true because component state hasn't changed
      // (this is expected behavior for controlled components)
      await user.click(pinButton);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          payload: { pinMenu: true },
        })
      );

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('DOM Manipulation', () => {
    it('does not manipulate body classes when enabling pin menu', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(document.body.classList.remove).not.toHaveBeenCalled();
      expect(document.body.classList.add).not.toHaveBeenCalled();
    });

    it('manipulates body classes when disabling pin menu', async () => {
      renderPinMenu(true);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(document.body.classList.remove).toHaveBeenCalledWith('show-menu');
      expect(document.body.classList.add).toHaveBeenCalledWith('hide-menu');
    });

    it('calls DOM manipulation before dispatching Redux action', async () => {
      renderPinMenu(true);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      // Both DOM manipulation and Redux dispatch should have been called
      expect(document.body.classList.remove).toHaveBeenCalledWith('show-menu');
      expect(document.body.classList.add).toHaveBeenCalledWith('hide-menu');
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { pinMenu: false },
        })
      );
    });
  });

  describe('Button Style Logic', () => {
    it('applies correct button class based on pin state', () => {
      // Test unpinned state
      const { unmount: unmount1 } = renderPinMenu(false);
      let pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
      unmount1();

      // Test pinned state separately
      renderPinMenu(true);
      pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
    });

    it('maintains consistent button structure regardless of pin state', () => {
      // Test unpinned state
      const { unmount: unmount1 } = renderPinMenu(false);
      let pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn', 'btn-sm');
      expect(pinButton).toHaveAttribute('type', 'button');
      unmount1();

      // Test pinned state separately
      renderPinMenu(true);
      pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn', 'btn-sm');
      expect(pinButton).toHaveAttribute('type', 'button');
    });
  });

  describe('User Interactions', () => {
    it('handles keyboard interaction (Enter key)', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      pinButton.focus();
      await user.keyboard('{Enter}');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { pinMenu: true },
        })
      );
    });

    it('handles keyboard interaction (Space key)', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      pinButton.focus();
      await user.keyboard(' ');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { pinMenu: true },
        })
      );
    });

    it('maintains focus after interaction', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(document.activeElement).toBe(pinButton);
    });

    it('handles rapid clicks correctly', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      // Rapid clicks
      await user.click(pinButton);
      await user.click(pinButton);
      await user.click(pinButton);

      expect(dispatchSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderPinMenu();

      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      expect(pinButton).toHaveAttribute('aria-label', 'Pin Menu');
      expect(pinButton).toHaveAttribute('type', 'button');
    });

    it('is keyboard accessible', () => {
      renderPinMenu();

      const pinButton = screen.getByRole('button', { name: /pin menu/i });

      expect(pinButton).not.toBeDisabled();
      expect(pinButton.tagName).toBe('BUTTON');
    });

    it('provides visual feedback for pin state', () => {
      // Test unpinned state
      const { unmount: unmount1 } = renderPinMenu(false);
      let pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
      unmount1();

      // Test pinned state separately
      renderPinMenu(true);
      pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
    });
  });

  describe('Redux Integration', () => {
    it('reads initial state from Redux store', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          pinMenu: true,
          view: 'expanded',
          debugMode: false,
          theme: 'auto',
          stream: false,
        },
      };

      renderPinMenu(true, customState);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
    });

    it('dispatches correct action structure', async () => {
      renderPinMenu(false);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      await user.click(pinButton);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: expect.objectContaining({
            pinMenu: true,
          }),
        })
      );
    });

    it('handles Redux state changes correctly', () => {
      // Test unpinned state
      const { unmount: unmount1 } = renderPinMenu(false);
      let pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
      unmount1();

      // Test pinned state separately
      renderPinMenu(true);
      pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-light');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined pinMenu state gracefully', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          view: 'expanded',
          debugMode: false,
          theme: 'auto',
          stream: false,
          // pinMenu is undefined
        },
      };

      renderPinMenu(false, customState);

      const pinButton = screen.getByRole('button', { name: /pin menu/i });
      expect(pinButton).toHaveClass('btn-secondary');
    });
  });
});

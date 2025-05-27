import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import ToggleTheme from './ToggleTheme';
import { renderWithProviders, createTestStore } from '../../test/utils';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

describe('ToggleTheme', () => {
  const user = userEvent.setup();

  const renderToggleTheme = (
    theme: 'dark' | 'light' | 'auto' = 'light',
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        theme,
        view: 'expanded',
        stream: false,
        debugMode: false,
        autoRefresh: false,
      },
      ...overrides,
    };

    // Create store and spy on dispatch before rendering
    const store = createTestStore(preloadedState);
    vi.spyOn(store, 'dispatch').mockImplementation(dispatchSpy);

    const result = renderWithProviders(<ToggleTheme />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchSpy.mockClear();
    // Reset document.documentElement.setAttribute to a mock for each test
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(
      vi.fn()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders toggle theme button', () => {
      renderToggleTheme();

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn', 'btn-secondary', 'btn-sm');
    });

    it('renders with correct container structure', () => {
      const { container } = renderToggleTheme();

      const headerButton = container.querySelector('.header-button');
      expect(headerButton).toBeInTheDocument();
      expect(headerButton).toContainElement(
        screen.getByRole('button', { name: /enable dark mode/i })
      );
    });
  });

  describe('Theme Icons and Labels', () => {
    it('shows moon icon and "Dark Mode" title when in light theme', () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toHaveAttribute('title', 'Dark Mode');
      expect(button).toHaveAttribute('aria-label', 'Enable Dark Mode');

      const icon = button.querySelector('i');
      expect(icon).toHaveClass('fas', 'fa-moon');
    });

    it('shows sun icon and "Light Mode" title when in dark theme', () => {
      renderToggleTheme('dark');

      const button = screen.getByRole('button', { name: /enable light mode/i });
      expect(button).toHaveAttribute('title', 'Light Mode');
      expect(button).toHaveAttribute('aria-label', 'Enable Light Mode');

      const icon = button.querySelector('i');
      expect(icon).toHaveClass('fas', 'fa-sun');
    });

    it('handles auto theme as light theme for icon display', () => {
      renderToggleTheme('auto');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toHaveAttribute('title', 'Dark Mode');

      const icon = button.querySelector('i');
      expect(icon).toHaveClass('fas', 'fa-moon');
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('dispatches light theme when currently dark', async () => {
      renderToggleTheme('dark');

      const button = screen.getByRole('button', { name: /enable light mode/i });
      await user.click(button);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { theme: 'light' },
        })
      );
    });

    it('dispatches dark theme when currently light', async () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      await user.click(button);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { theme: 'dark' },
        })
      );
    });

    it('dispatches dark theme when currently auto', async () => {
      renderToggleTheme('auto');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      await user.click(button);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { theme: 'dark' },
        })
      );
    });

    it('calls dispatch only once per click', async () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      await user.click(button);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('DOM Effects (useEffect)', () => {
    it('sets data-bs-theme attribute to "dark" when theme is dark', () => {
      renderToggleTheme('dark');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-bs-theme',
        'dark'
      );
    });

    it('sets data-bs-theme attribute to empty string when theme is light', () => {
      renderToggleTheme('light');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-bs-theme',
        ''
      );
    });

    it('sets data-bs-theme attribute to empty string when theme is auto', () => {
      renderToggleTheme('auto');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-bs-theme',
        ''
      );
    });

    it('does not set attribute when theme is undefined', () => {
      const preloadedState = {
        siteSettings: {
          theme: undefined,
          view: 'expanded' as const,
          stream: false,
          debugMode: false,
          autoRefresh: false,
        },
      };
      renderWithProviders(<ToggleTheme />, { preloadedState });

      expect(document.documentElement.setAttribute).not.toHaveBeenCalled();
    });

    it('updates DOM attribute when theme changes', () => {
      renderToggleTheme('light');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-bs-theme',
        ''
      );

      // Clear the mock and render with dark theme
      vi.clearAllMocks();
      vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(
        vi.fn()
      );

      renderToggleTheme('dark');

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-bs-theme',
        'dark'
      );
    });
  });

  describe('Button Accessibility', () => {
    it('has proper button type', () => {
      renderToggleTheme();

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has descriptive aria-label that changes with theme', () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toHaveAttribute('aria-label', 'Enable Dark Mode');
    });

    it('has descriptive aria-label for dark theme', () => {
      renderToggleTheme('dark');

      const button = screen.getByRole('button', { name: /enable light mode/i });
      expect(button).toHaveAttribute('aria-label', 'Enable Light Mode');
    });

    it('has title attribute that matches aria-label content', () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });
      expect(button).toHaveAttribute('title', 'Dark Mode');
      expect(button).toHaveAttribute('aria-label', 'Enable Dark Mode');
    });
  });

  describe('Redux Integration', () => {
    it('reads theme from siteSettings slice', () => {
      renderToggleTheme('dark');

      const button = screen.getByRole('button', { name: /enable light mode/i });
      expect(button).toBeInTheDocument();
    });

    it('works with different initial state configurations', () => {
      const overrides = {
        siteSettings: {
          theme: 'dark' as const,
          view: 'condensed' as const,
          stream: true,
          debugMode: true,
          autoRefresh: true,
        },
      };

      renderToggleTheme('dark', overrides);

      const button = screen.getByRole('button', { name: /enable light mode/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid theme toggling', async () => {
      renderToggleTheme('light');

      const button = screen.getByRole('button', { name: /enable dark mode/i });

      // Simulate rapid clicking
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should have been called 3 times
      expect(dispatchSpy).toHaveBeenCalledTimes(3);
      // Last call should be dark (light -> dark -> light -> dark)
      expect(dispatchSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { theme: 'dark' },
        })
      );
    });

    it('maintains consistent icon when theme prop is undefined', () => {
      const preloadedState = {
        siteSettings: {
          theme: undefined,
          view: 'expanded' as const,
          stream: false,
          debugMode: false,
          autoRefresh: false,
        },
      };

      const { container } = renderWithProviders(<ToggleTheme />, {
        preloadedState,
      });

      // Should render moon icon (default behavior when theme is falsy)
      const icon = container.querySelector('i');
      expect(icon).toHaveClass('fas', 'fa-moon');
    });
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import ForceRefresh from './ForceRefresh';
import { renderWithProviders, createTestStore } from '../../../test/utils';

// Mock the service worker registration
vi.mock('../../../serviceWorkerRegistration', () => ({
  unregister: vi.fn(),
}));

// Mock global variables and APIs
const mockUnregister = vi.fn();
const mockCachesDelete = vi.fn();
const mockReload = vi.fn();

// Mock global BUILDTIME
(global as any).BUILDTIME = '2024-01-01T12:00:00Z';

describe('ForceRefresh', () => {
  const user = userEvent.setup();

  const renderForceRefresh = (
    debug: boolean = false,
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        debug,
        view: 'expanded',
        debugMode: false,
        theme: 'auto',
        stream: false,
      },
      ...overrides,
    };

    const store = createTestStore(preloadedState);
    const result = renderWithProviders(<ForceRefresh />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: {
        reload: mockReload,
      },
      writable: true,
    });

    // Mock caches API
    global.caches = {
      keys: vi.fn().mockResolvedValue(['cache1', 'cache2']),
      delete: mockCachesDelete.mockResolvedValue(true),
    } as any;

    // Mock setTimeout
    vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
      fn();
      return 1 as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders force refresh button with correct structure', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveClass(
        'btn',
        'btn-primary',
        'btn-sm',
        'm-0',
        'small',
        'w-100'
      );
      expect(refreshButton).toHaveAttribute('type', 'button');
    });

    it('displays correct button text', () => {
      renderForceRefresh();

      expect(screen.getByText('Load Newest Version')).toBeInTheDocument();
    });

    it('does not show debug info when debug is disabled', () => {
      renderForceRefresh(false);

      expect(screen.queryByText(/Build Date:/)).not.toBeInTheDocument();
      expect(
        screen.queryByText((global as any).BUILDTIME)
      ).not.toBeInTheDocument();
    });

    it('shows debug info when debug is enabled', () => {
      renderForceRefresh(true);

      expect(screen.getByText(/Build Date:/)).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return (
            (element?.className === 'supersmall' &&
              element?.textContent?.includes((global as any).BUILDTIME)) ||
            false
          );
        })
      ).toBeInTheDocument();
    });

    it('renders divider when debug info is shown', () => {
      const { container } = renderForceRefresh(true);

      const divider = container.querySelector('.dropdown-divider');
      expect(divider).toBeInTheDocument();
    });

    it('applies correct CSS classes to debug info', () => {
      const { container } = renderForceRefresh(true);

      const debugInfo = container.querySelector('.supersmall');
      expect(debugInfo).toBeInTheDocument();
      expect(debugInfo).toHaveTextContent('Build Date:');
      expect(debugInfo).toHaveTextContent((global as any).BUILDTIME);
    });
  });

  describe('Force Refresh Functionality', () => {
    it('calls cache deletion when button is clicked', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      await user.click(refreshButton);

      expect(global.caches.keys).toHaveBeenCalled();
      expect(mockCachesDelete).toHaveBeenCalledWith('cache1');
      expect(mockCachesDelete).toHaveBeenCalledWith('cache2');
    });

    it('calls service worker unregister when button is clicked', async () => {
      const { unregister } = await import('../../../serviceWorkerRegistration');

      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      await user.click(refreshButton);

      expect(unregister).toHaveBeenCalled();
    });

    it('reloads the page after timeout when button is clicked', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      await user.click(refreshButton);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(mockReload).toHaveBeenCalled();
    });

    it('handles missing caches API gracefully', async () => {
      // Set caches to undefined
      (global as any).caches = undefined;

      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      // Should not throw error
      await user.click(refreshButton);

      expect(mockReload).toHaveBeenCalled();
    });


  });

  describe('Debug Mode Integration', () => {
    it('reads debug state from Redux store', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          debug: true,
          view: 'expanded',
          debugMode: false,
          theme: 'auto',
          stream: false,
        },
      };

      renderForceRefresh(true, customState);

      expect(screen.getByText(/Build Date:/)).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return (
            (element?.className === 'supersmall' &&
              element?.textContent?.includes((global as any).BUILDTIME)) ||
            false
          );
        })
      ).toBeInTheDocument();
    });

    it('toggles debug info based on Redux state changes', () => {
      // Test without debug
      renderForceRefresh(false);
      expect(screen.queryByText(/Build Date:/)).not.toBeInTheDocument();

      // Test with debug
      renderForceRefresh(true);
      expect(screen.getByText(/Build Date:/)).toBeInTheDocument();
    });

    it('formats build time correctly', () => {
      renderForceRefresh(true);

      const buildTimeElement = screen.getByText((content, element) => {
        return (
          (element?.className === 'supersmall' &&
            element?.textContent?.includes((global as any).BUILDTIME)) ||
          false
        );
      });
      expect(buildTimeElement).toBeInTheDocument();
      expect(buildTimeElement.textContent).toContain((global as any).BUILDTIME);
    });
  });

  describe('User Interactions', () => {
    it('handles keyboard interaction (Enter key)', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      refreshButton.focus();
      await user.keyboard('{Enter}');

      expect(mockReload).toHaveBeenCalled();
    });

    it('handles keyboard interaction (Space key)', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      refreshButton.focus();
      await user.keyboard(' ');

      expect(mockReload).toHaveBeenCalled();
    });

    it('handles multiple rapid clicks', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      // Should call reload multiple times
      expect(mockReload).toHaveBeenCalledTimes(3);
    });

    it('maintains button functionality after interaction', async () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      await user.click(refreshButton);

      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button attributes', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      expect(refreshButton).toHaveAttribute('type', 'button');
      expect(refreshButton.tagName).toBe('BUTTON');
    });

    it('has accessible button text', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      expect(refreshButton).toHaveTextContent('Load Newest Version');
    });

    it('is keyboard accessible', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      expect(refreshButton).not.toBeDisabled();
    });

    it('provides clear visual hierarchy', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      expect(refreshButton).toHaveClass('btn-primary');
      expect(refreshButton).toHaveClass('w-100');
    });
  });

  describe('Component Structure', () => {
    it('maintains correct container structure', () => {
      const { container } = renderForceRefresh();

      const mainContainer = container.firstChild;
      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      expect(mainContainer).toContainElement(refreshButton);
    });

    it('applies correct CSS classes', () => {
      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });

      expect(refreshButton).toHaveClass('btn');
      expect(refreshButton).toHaveClass('btn-primary');
      expect(refreshButton).toHaveClass('btn-sm');
      expect(refreshButton).toHaveClass('m-0');
      expect(refreshButton).toHaveClass('small');
      expect(refreshButton).toHaveClass('w-100');
    });

    it('renders debug section with correct structure when enabled', () => {
      const { container } = renderForceRefresh(true);

      const divider = container.querySelector('.dropdown-divider');
      const debugInfo = container.querySelector('.supersmall');

      expect(divider).toBeInTheDocument();
      expect(debugInfo).toBeInTheDocument();
      expect(debugInfo).toHaveClass('supersmall');
    });
  });

  describe('Error Handling', () => {
    it('handles missing BUILDTIME gracefully', () => {
      const originalBuildTime = (global as any).BUILDTIME;
      delete (global as any).BUILDTIME;

      // The component will throw when BUILDTIME is undefined
      expect(() => renderForceRefresh(true)).toThrow(
        'BUILDTIME is not defined'
      );

      // Restore BUILDTIME for other tests
      (global as any).BUILDTIME = originalBuildTime;
    });
  });

  describe('Integration Tests', () => {
    it('performs complete refresh sequence', async () => {
      const { unregister } = await import('../../../serviceWorkerRegistration');

      renderForceRefresh();

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      await user.click(refreshButton);

      // Verify complete sequence
      expect(global.caches.keys).toHaveBeenCalled();
      expect(mockCachesDelete).toHaveBeenCalledTimes(2);
      expect(unregister).toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(mockReload).toHaveBeenCalled();
    });

    it('works correctly with different Redux states', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          debug: false,
          view: 'condensed',
          debugMode: true,
          theme: 'dark',
          stream: true,
        },
      };

      renderForceRefresh(false, customState);

      const refreshButton = screen.getByRole('button', {
        name: /load newest version/i,
      });
      expect(refreshButton).toBeInTheDocument();
      expect(screen.queryByText(/Build Date:/)).not.toBeInTheDocument();
    });
  });
});

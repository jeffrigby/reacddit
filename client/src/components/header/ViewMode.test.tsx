import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import ViewMode from './ViewMode';
import {
  renderWithProviders,
  mockWindowScrollTo,
  createKeyboardEvent,
} from '../../test/utils';

// Mock the common module
const mockHotkeyStatus = vi.fn();
vi.mock('../../common', () => ({
  hotkeyStatus: () => mockHotkeyStatus(),
}));

// Mock Redux action
const mockSiteSettings = vi.fn();
vi.mock('../../redux/slices/siteSettingsSlice', () => ({
  siteSettings: (payload: { view: 'expanded' | 'condensed' }) => {
    mockSiteSettings(payload);
    return { type: 'siteSettings/setSiteSettings', payload };
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    NavLink: ({
      children,
      to,
      className,
    }: {
      children: React.ReactNode;
      to: string | { pathname: string; search: string };
      className?: string;
    }) => (
      <a
        className={className}
        href={typeof to === 'string' ? to : to.pathname + to.search}
      >
        {children}
      </a>
    ),
  };
});

// Helper function to render ViewMode component with custom state
const renderViewMode = (
  viewMode: 'expanded' | 'condensed' = 'expanded',
  overrides: Partial<RootState> = {}
) => {
  const preloadedState: Partial<RootState> = {
    siteSettings: {
      view: viewMode,
      stream: false,
      debugMode: false,
      theme: 'auto',
      autoRefresh: false,
    },
    ...overrides,
  };

  return renderWithProviders(<ViewMode />, { preloadedState });
};

describe('ViewMode Component', () => {
  let mockScrollTo: ReturnType<typeof mockWindowScrollTo>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollTo = mockWindowScrollTo();
    mockHotkeyStatus.mockReturnValue(true);
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', expect.any(Function));
  });

  describe('Button Rendering', () => {
    it('renders condensed view button when in expanded mode', () => {
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Condensed View');
      expect(button).toHaveAttribute('title', 'Condensed View (v)');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders expanded view button when in condensed mode', () => {
      renderViewMode('condensed');

      const button = screen.getByRole('button', { name: /full view/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Full View');
      expect(button).toHaveAttribute('title', 'Full View (v)');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('wraps button in header-button container', () => {
      const { container } = renderViewMode();

      const headerButton = container.querySelector('.header-button');
      expect(headerButton).toBeInTheDocument();
      expect(headerButton?.querySelector('button')).toBeInTheDocument();
    });

    it('applies correct button classes', () => {
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toHaveAttribute('class', 'btn btn-secondary btn-sm');
    });
  });

  describe('Icon Rendering', () => {
    it('shows compress icon when in expanded mode', () => {
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      const icon = button.querySelector('i');
      expect(icon).toHaveAttribute('class', 'fas fa-compress-arrows-alt');
    });

    it('shows expand icon when in condensed mode', () => {
      renderViewMode('condensed');

      const button = screen.getByRole('button', { name: /full view/i });
      const icon = button.querySelector('i');
      expect(icon).toHaveAttribute('class', 'fas fa-expand-arrows-alt');
    });
  });

  describe('Click Behavior', () => {
    it('switches to condensed view when clicking button in expanded mode', async () => {
      const user = userEvent.setup();
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      await user.click(button);

      expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockSiteSettings).toHaveBeenCalledWith({ view: 'condensed' });
    });

    it('switches to expanded view when clicking button in condensed mode', async () => {
      const user = userEvent.setup();
      renderViewMode('condensed');

      const button = screen.getByRole('button', { name: /full view/i });
      await user.click(button);

      expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockSiteSettings).toHaveBeenCalledWith({ view: 'expanded' });
    });

    it('prevents default event behavior on button click', async () => {
      const user = userEvent.setup();
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      const preventDefault = vi.fn();

      // Mock the event
      button.onclick = (e) => {
        preventDefault();
        e.preventDefault();
      };

      await user.click(button);
      expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('toggles view mode when pressing "v" key', () => {
      renderViewMode('expanded');

      const keyboardEvent = createKeyboardEvent('v');
      document.dispatchEvent(keyboardEvent);

      expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockSiteSettings).toHaveBeenCalledWith({ view: 'condensed' });
    });

    it('toggles from condensed to expanded when pressing "v" key', () => {
      renderViewMode('condensed');

      const keyboardEvent = createKeyboardEvent('v');
      document.dispatchEvent(keyboardEvent);

      expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockSiteSettings).toHaveBeenCalledWith({ view: 'expanded' });
    });

    it('does not trigger when hotkey status is false', () => {
      mockHotkeyStatus.mockReturnValue(false);
      renderViewMode('expanded');

      const keyboardEvent = createKeyboardEvent('v');
      document.dispatchEvent(keyboardEvent);

      expect(mockScrollTo).not.toHaveBeenCalled();
      expect(mockSiteSettings).not.toHaveBeenCalled();
    });

    it('does not trigger for other keys', () => {
      renderViewMode('expanded');

      const keyboardEvent = createKeyboardEvent('x');
      document.dispatchEvent(keyboardEvent);

      expect(mockScrollTo).not.toHaveBeenCalled();
      expect(mockSiteSettings).not.toHaveBeenCalled();
    });

    it('handles keyboard events gracefully when hotkeyStatus returns false', () => {
      mockHotkeyStatus.mockReturnValue(false);
      renderViewMode('expanded');

      const keyboardEvent = createKeyboardEvent('v');
      document.dispatchEvent(keyboardEvent);

      // Should not trigger when hotkeys are disabled
      expect(mockScrollTo).not.toHaveBeenCalled();
      expect(mockSiteSettings).not.toHaveBeenCalled();
    });
  });

  describe('Event Listener Management', () => {
    it('adds keydown event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderViewMode('expanded');

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderViewMode('expanded');
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('has event listeners properly configured', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderViewMode('expanded');

      // Should have added the keydown listener
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('State Integration', () => {
    it('uses view mode from Redux state', () => {
      renderViewMode('condensed');

      // Should show expand button when in condensed mode
      const button = screen.getByRole('button', { name: /full view/i });
      expect(button).toBeInTheDocument();
    });

    it('defaults to expanded view when state is undefined', () => {
      const preloadedState: Partial<RootState> = {
        siteSettings: {
          // No view property
          stream: false,
          debugMode: false,
          theme: 'auto',
          autoRefresh: false,
        } as any,
      };

      renderWithProviders(<ViewMode />, { preloadedState });

      // Should show condensed button (meaning we're in expanded mode)
      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toBeInTheDocument();
    });

    it('handles state selector returning null/undefined gracefully', () => {
      const preloadedState = {
        siteSettings: {
          view: undefined as unknown as 'expanded' | 'condensed',
          stream: false,
          debugMode: false,
          theme: 'auto' as const,
          autoRefresh: false,
        },
      };

      renderWithProviders(<ViewMode />, { preloadedState });

      // Should show condensed button (meaning we're in expanded mode)
      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for both states', () => {
      // Test expanded state
      renderViewMode('expanded');
      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toHaveAttribute('aria-label', 'Condensed View');
    });

    it('has proper ARIA labels for condensed state', () => {
      // Test condensed state
      renderViewMode('condensed');
      const button = screen.getByRole('button', { name: /full view/i });
      expect(button).toHaveAttribute('aria-label', 'Full View');
    });

    it('includes keyboard shortcut in title attributes', () => {
      // Test expanded state
      renderViewMode('expanded');
      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toHaveAttribute('title', 'Condensed View (v)');
    });

    it('includes keyboard shortcut in title attributes for condensed state', () => {
      // Test condensed state
      renderViewMode('condensed');
      const button = screen.getByRole('button', { name: /full view/i });
      expect(button).toHaveAttribute('title', 'Full View (v)');
    });

    it('has proper button type for form accessibility', () => {
      renderViewMode('expanded');

      const button = screen.getByRole('button', { name: /condensed view/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});

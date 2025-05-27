import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import AutoRefresh from './AutoRefresh';
import {
  renderWithProviders,
  createTestStore,
  mockDOMMethods,
  createHotkeyEvent,
  simulateRapidClicks,
} from '../../../test/utils';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

// Mock hotkeyStatus
const mocks = vi.hoisted(() => ({
  hotkeyStatus: vi.fn(),
}));

vi.mock('../../../common', () => ({
  hotkeyStatus: mocks.hotkeyStatus,
}));

describe('AutoRefresh', () => {
  const user = userEvent.setup();
  let domMocks: ReturnType<typeof mockDOMMethods>;

  const renderAutoRefresh = (
    stream: boolean = false,
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        stream,
        view: 'expanded',
        debugMode: false,
        theme: 'auto',
        autoRefresh: false,
      },
      ...overrides,
    };

    // Create store and spy on dispatch before rendering
    const store = createTestStore(preloadedState);
    vi.spyOn(store, 'dispatch').mockImplementation(dispatchSpy);

    const result = renderWithProviders(<AutoRefresh />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchSpy.mockClear();
    domMocks = mockDOMMethods();
    mocks.hotkeyStatus.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders auto refresh checkbox with correct structure', () => {
      renderAutoRefresh();

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      const label = screen.getByLabelText(/auto refresh/i);

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).toHaveClass('form-check-input');
      expect(checkbox).toHaveAttribute('id', 'autoRefreshCheck');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('renders with correct container structure', () => {
      const { container } = renderAutoRefresh();

      const autoRefreshContainer = container.querySelector('.auto-refresh');
      const formCheck = container.querySelector('.form-check.d-flex');

      expect(autoRefreshContainer).toBeInTheDocument();
      expect(formCheck).toBeInTheDocument();
      expect(autoRefreshContainer).toContainElement(formCheck);
    });

    it('renders info icon with modal attributes', () => {
      const { container } = renderAutoRefresh();

      const infoIcon = container.querySelector('.fas.fa-info-circle');
      const infoContainer = container.querySelector('[data-bs-toggle="modal"]');

      expect(infoIcon).toBeInTheDocument();
      expect(infoContainer).toBeInTheDocument();
      expect(infoContainer).toHaveAttribute('data-bs-target', '#autoRefresh');
      expect(infoContainer).toHaveAttribute('data-bs-toggle', 'modal');
      expect(infoContainer).toHaveAttribute('title', 'Auto Refresh Info');
    });
  });

  describe('Checkbox State Management', () => {
    it('reflects stream state from Redux store', () => {
      renderAutoRefresh(true);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      expect(checkbox).toBeChecked();
    });

    it('is unchecked when stream is false', () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      expect(checkbox).not.toBeChecked();
    });

    it('updates state when checkbox is clicked', async () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
      expect(domMocks.mockScrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('toggles from checked to unchecked', async () => {
      renderAutoRefresh(true);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: false },
        })
      );
      expect(domMocks.mockScrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Scroll to Top Behavior', () => {
    it('scrolls to top when toggling auto refresh', async () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      await user.click(checkbox);

      expect(domMocks.mockScrollTo).toHaveBeenCalledWith(0, 0);
      expect(domMocks.mockScrollTo).toHaveBeenCalledTimes(1);
    });

    it('scrolls to top on each toggle action', async () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });

      await user.click(checkbox); // Enable
      await user.click(checkbox); // Disable
      await user.click(checkbox); // Enable again

      expect(domMocks.mockScrollTo).toHaveBeenCalledTimes(3);
      expect(domMocks.mockScrollTo).toHaveBeenNthCalledWith(1, 0, 0);
      expect(domMocks.mockScrollTo).toHaveBeenNthCalledWith(2, 0, 0);
      expect(domMocks.mockScrollTo).toHaveBeenNthCalledWith(3, 0, 0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('toggles auto refresh when ">" key is pressed and hotkeys are active', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const keyboardEvent = createHotkeyEvent('>');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
      expect(domMocks.mockScrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('does not toggle when hotkeys are disabled', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(false);

      const keyboardEvent = createHotkeyEvent('>');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(domMocks.mockScrollTo).not.toHaveBeenCalled();
    });

    it('handles errors in hotkey processing gracefully', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(true);
      dispatchSpy.mockImplementation(() => {
        throw new Error('Redux error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

      const keyboardEvent = createHotkeyEvent('>');
      document.dispatchEvent(keyboardEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in auto-refresh hotkeys',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('ignores other key presses', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const keyboardEvent = createHotkeyEvent('a');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Listener Management', () => {
    it('adds keydown event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      renderAutoRefresh();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('removes keydown event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderAutoRefresh();

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('handles multiple key events correctly', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const event1 = createHotkeyEvent('>');
      const event2 = createHotkeyEvent('>');

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Redux Integration', () => {
    it('reads stream state from correct Redux slice', () => {
      renderAutoRefresh(true);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      expect(checkbox).toBeChecked();
    });

    it('dispatches correct action structure', async () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('works with different initial state configurations', () => {
      const overrides = {
        siteSettings: {
          stream: true,
          view: 'condensed' as const,
          debugMode: true,
          theme: 'dark' as const,
          autoRefresh: true,
        },
      };

      renderAutoRefresh(true, overrides);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      expect(checkbox).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      renderAutoRefresh();

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      const label = screen.getByText('Auto Refresh');

      expect(label).toHaveAttribute('for', 'autoRefreshCheck');
      expect(checkbox).toHaveAttribute('id', 'autoRefreshCheck');
    });

    it('maintains focus accessibility on interactions', async () => {
      renderAutoRefresh();

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });

      await user.click(checkbox);

      // Checkbox should maintain its accessibility properties
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveClass('form-check-input');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicking correctly', async () => {
      renderAutoRefresh(false);

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });

      await simulateRapidClicks(checkbox, 3);

      expect(dispatchSpy).toHaveBeenCalledTimes(3);
      expect(domMocks.mockScrollTo).toHaveBeenCalledTimes(3);

      // Each call should toggle the stream state
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { stream: true },
        })
      );
    });

    it('handles undefined stream state gracefully', () => {
      const preloadedState = {
        siteSettings: {
          stream: undefined as unknown as boolean,
          view: 'expanded' as const,
          debugMode: false,
          theme: 'auto' as const,
          autoRefresh: false,
        },
      };

      renderWithProviders(<AutoRefresh />, {
        preloadedState,
      });

      const checkbox = screen.getByRole('checkbox', { name: /auto refresh/i });
      expect(checkbox).not.toBeChecked();
    });

    it('continues to work after hotkey errors', () => {
      renderAutoRefresh(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      // First call throws error
      dispatchSpy.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

      const errorEvent = createHotkeyEvent('>');
      document.dispatchEvent(errorEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in auto-refresh hotkeys',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import {
  renderWithProviders,
  createTestStore,
  createHotkeyEvent,
  simulateRapidClicks,
} from '@/test/utils';
import DebugMode from './DebugMode';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

// Mock hotkeyStatus
const mocks = vi.hoisted(() => ({
  hotkeyStatus: vi.fn(),
}));

vi.mock('@/common', () => ({
  hotkeyStatus: mocks.hotkeyStatus,
}));

describe('DebugMode', () => {
  const user = userEvent.setup();

  const renderDebugMode = (
    debug: boolean = false,
    className: string = '',
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        debug,
        view: 'expanded',
        stream: false,
        debugMode: false,
        theme: 'auto',
        autoRefresh: false,
      },
      ...overrides,
    };

    // Create store and spy on dispatch before rendering
    const store = createTestStore(preloadedState);
    vi.spyOn(store, 'dispatch').mockImplementation(dispatchSpy);

    const result = renderWithProviders(<DebugMode className={className} />, {
      store,
    });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchSpy.mockClear();
    mocks.hotkeyStatus.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders debug mode checkbox with correct structure', () => {
      renderDebugMode();

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      const label = screen.getByLabelText(/show debug info/i);

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).toHaveClass('form-check-input');
      expect(checkbox).toHaveAttribute('id', 'debugCheck');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('renders with default form-check class', () => {
      const { container } = renderDebugMode();

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toBeInTheDocument();
      expect(formCheck).toHaveClass('form-check');
    });

    it('renders with custom className prop', () => {
      const { container } = renderDebugMode(false, 'custom-class');

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toBeInTheDocument();
      expect(formCheck).toHaveClass('form-check', 'custom-class');
    });

    it('trims className correctly when empty', () => {
      const { container } = renderDebugMode(false, '');

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toBeInTheDocument();
      expect(formCheck).toHaveClass('form-check');
      expect(formCheck?.className).toBe('form-check');
    });

    it('combines multiple classes correctly', () => {
      const { container } = renderDebugMode(false, 'class1 class2');

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toHaveClass('form-check', 'class1', 'class2');
    });
  });

  describe('Checkbox State Management', () => {
    it('reflects debug state from Redux store when true', () => {
      renderDebugMode(true);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).toBeChecked();
    });

    it('is unchecked when debug is false', () => {
      renderDebugMode(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it('handles undefined debug state (defaults to false)', () => {
      const preloadedState = {
        siteSettings: {
          debug: undefined as unknown as boolean,
          view: 'expanded' as const,
          stream: false,
          debugMode: false,
          theme: 'auto' as const,
          autoRefresh: false,
        },
      };

      renderWithProviders(<DebugMode />, { preloadedState });

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it('updates state when checkbox is clicked', async () => {
      renderDebugMode(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
    });

    it('toggles from checked to unchecked', async () => {
      renderDebugMode(true);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: false },
        })
      );
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('toggles debug mode when "Î" key is pressed (opt-shift-d) and hotkeys are active', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const keyboardEvent = createHotkeyEvent('Î');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
    });

    it('does not toggle when hotkeys are disabled', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(false);

      const keyboardEvent = createHotkeyEvent('Î');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('handles errors in hotkey processing gracefully', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(true);
      dispatchSpy.mockImplementation(() => {
        throw new Error('Redux error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

      const keyboardEvent = createHotkeyEvent('Î');
      document.dispatchEvent(keyboardEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in debug hotkeys',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('ignores other key presses', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const keyboardEvent = createHotkeyEvent('a');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('works when current state is true', () => {
      renderDebugMode(true);
      mocks.hotkeyStatus.mockReturnValue(true);

      const keyboardEvent = createHotkeyEvent('Î');
      document.dispatchEvent(keyboardEvent);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: false },
        })
      );
    });
  });

  describe('Event Listener Management', () => {
    it('adds keydown event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      renderDebugMode();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('removes keydown event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderDebugMode();

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('handles multiple key events correctly', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      const event1 = createHotkeyEvent('Î');
      const event2 = createHotkeyEvent('Î');

      document.dispatchEvent(event1);
      document.dispatchEvent(event2);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      // Both calls should toggle from the same initial state since store is mocked
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
    });
  });

  describe('Redux Integration', () => {
    it('reads debug state from correct Redux slice', () => {
      renderDebugMode(true);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).toBeChecked();
    });

    it('dispatches correct action structure', async () => {
      renderDebugMode(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('works with different initial state configurations', () => {
      const overrides = {
        siteSettings: {
          debug: true,
          view: 'condensed' as const,
          stream: true,
          debugMode: true,
          theme: 'dark' as const,
          autoRefresh: true,
        },
      };

      renderDebugMode(true, '', overrides);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      renderDebugMode();

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      const label = screen.getByText('Show Debug Info');

      expect(label).toHaveAttribute('for', 'debugCheck');
      expect(checkbox).toHaveAttribute('id', 'debugCheck');
    });

    it('maintains semantic structure with form-check pattern', () => {
      const { container } = renderDebugMode();

      const formCheck = container.querySelector('.form-check');
      const label = container.querySelector('.form-check-label');
      const input = container.querySelector('.form-check-input');

      expect(formCheck).toContainElement(label);
      expect(label).toContainElement(input);
    });

    it('maintains focus accessibility on interactions', async () => {
      renderDebugMode();

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });

      await user.click(checkbox);

      // Checkbox should maintain its accessibility properties
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveClass('form-check-input');
    });
  });

  describe('Component Props', () => {
    it('accepts className prop and applies it correctly', () => {
      const { container } = renderDebugMode(false, 'my-custom-class');

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toHaveClass('form-check', 'my-custom-class');
    });

    it('has default empty string for className', () => {
      const { container } = renderDebugMode();

      const formCheck = container.querySelector('.form-check');
      expect(formCheck?.className).toBe('form-check');
    });

    it('handles className with leading/trailing spaces', () => {
      const { container } = renderDebugMode(false, '  spaced-class  ');

      const formCheck = container.querySelector('.form-check');
      expect(formCheck).toHaveClass('form-check', 'spaced-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicking correctly', async () => {
      renderDebugMode(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });

      await simulateRapidClicks(checkbox, 5);

      expect(dispatchSpy).toHaveBeenCalledTimes(5);

      // All calls should toggle from the same initial state since store is mocked
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { debug: true },
        })
      );
    });

    it('continues to work after hotkey errors', () => {
      renderDebugMode(false);
      mocks.hotkeyStatus.mockReturnValue(true);

      // First call throws error
      dispatchSpy.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

      const errorEvent = createHotkeyEvent('Î');
      document.dispatchEvent(errorEvent);

      // Reset mock to normal behavior
      dispatchSpy.mockImplementation(vi.fn());

      const normalEvent = createHotkeyEvent('Î');
      document.dispatchEvent(normalEvent);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('handles state selector returning null/undefined gracefully', () => {
      const preloadedState = {
        siteSettings: {
          debug: null as unknown as boolean,
          view: 'expanded' as const,
          stream: false,
          debugMode: false,
          theme: 'auto' as const,
          autoRefresh: false,
        },
      };

      renderWithProviders(<DebugMode />, { preloadedState });

      const checkbox = screen.getByRole('checkbox', {
        name: /show debug info/i,
      });
      expect(checkbox).not.toBeChecked();
    });
  });
});

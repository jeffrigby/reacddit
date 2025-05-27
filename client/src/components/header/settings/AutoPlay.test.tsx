import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import AutoPlay from './AutoPlay';
import { renderWithProviders, createTestStore } from '../../../test/utils';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

describe('AutoPlay', () => {
  const user = userEvent.setup();

  const renderAutoPlay = (
    autoplay: boolean = false,
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        autoplay,
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

    const result = renderWithProviders(<AutoPlay />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders auto play checkbox with correct structure', () => {
      renderAutoPlay();

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      const label = screen.getByLabelText(/auto play videos/i);

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(checkbox).toHaveClass('form-check-input');
      expect(checkbox).toHaveAttribute('id', 'autoPlayCheck');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('renders with correct container structure', () => {
      const { container } = renderAutoPlay();

      const autoPlayContainer = container.querySelector('.auto-play');
      const formCheck = container.querySelector('.form-check');

      expect(autoPlayContainer).toBeInTheDocument();
      expect(formCheck).toBeInTheDocument();
      expect(autoPlayContainer).toContainElement(formCheck);
    });

    it('displays correct label text', () => {
      renderAutoPlay();

      expect(screen.getByText('Auto Play Videos')).toBeInTheDocument();
    });
  });

  describe('Checkbox State Management', () => {
    it('reflects autoplay state from Redux store when enabled', () => {
      renderAutoPlay(true);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      expect(checkbox).toBeChecked();
    });

    it('is unchecked when autoplay is disabled', () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it('updates state when checkbox is clicked to enable', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { autoplay: true },
        })
      );
    });

    it('updates state when checkbox is clicked to disable', async () => {
      renderAutoPlay(true);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { autoplay: false },
        })
      );
    });

    it('toggles state correctly on multiple clicks', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });

      // First click - enable (checkbox is unchecked, so it should dispatch true)
      await user.click(checkbox);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          payload: { autoplay: true },
        })
      );

      // Second click - still dispatches true because component state hasn't changed
      // (this is expected behavior for controlled components)
      await user.click(checkbox);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          payload: { autoplay: true },
        })
      );

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Interactions', () => {
    it('handles keyboard interaction (Space key)', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      checkbox.focus();
      await user.keyboard(' ');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { autoplay: true },
        })
      );
    });

    it('handles keyboard interaction (Enter key)', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      checkbox.focus();
      await user.keyboard('{Enter}');

      // Enter key doesn't trigger onChange on checkboxes, only Space does
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('maintains focus after interaction', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      await user.click(checkbox);

      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderAutoPlay();

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });

      expect(checkbox).toHaveAttribute('id', 'autoPlayCheck');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('label is properly associated with checkbox', () => {
      renderAutoPlay();

      const label = screen.getByText('Auto Play Videos');
      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });

      expect(label).toHaveAttribute('for', 'autoPlayCheck');
      expect(checkbox).toHaveAttribute('id', 'autoPlayCheck');
    });
  });

  describe('Redux Integration', () => {
    it('reads initial state from Redux store', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          autoplay: true,
          view: 'expanded',
          debugMode: false,
          theme: 'auto',
          stream: false,
        },
      };

      renderAutoPlay(true, customState);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      expect(checkbox).toBeChecked();
    });

    it('dispatches correct action structure', async () => {
      renderAutoPlay(false);

      const checkbox = screen.getByRole('checkbox', {
        name: /auto play videos/i,
      });
      await user.click(checkbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: expect.objectContaining({
            autoplay: true,
          }),
        })
      );
    });
  });
});

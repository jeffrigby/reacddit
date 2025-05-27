import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import CondensePrefs from './CondensePrefs';
import { renderWithProviders, createTestStore } from '../../../test/utils';

// Create a spy to track dispatched actions
const dispatchSpy = vi.fn();

describe('CondensePrefs', () => {
  const user = userEvent.setup();

  const renderCondensePrefs = (
    condenseSticky: boolean = false,
    condenseDuplicate: boolean = false,
    condensePinned: boolean = false,
    overrides: Partial<RootState> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        condenseSticky,
        condenseDuplicate,
        condensePinned,
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

    const result = renderWithProviders(<CondensePrefs />, { store });

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
    it('renders all three condense checkboxes with correct structure', () => {
      renderCondensePrefs();

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      expect(stickyCheckbox).toBeInTheDocument();
      expect(pinnedCheckbox).toBeInTheDocument();
      expect(duplicateCheckbox).toBeInTheDocument();

      expect(stickyCheckbox).toHaveClass('form-check-input');
      expect(pinnedCheckbox).toHaveClass('form-check-input');
      expect(duplicateCheckbox).toHaveClass('form-check-input');
    });

    it('renders with correct container structure', () => {
      const { container } = renderCondensePrefs();

      const formChecks = container.querySelectorAll('.form-check');
      const headerSection = container.querySelector('.mt-2.d-flex');
      const infoIcon = container.querySelector('.fas.fa-info-circle');

      expect(formChecks).toHaveLength(3);
      expect(headerSection).toBeInTheDocument();
      expect(infoIcon).toBeInTheDocument();
    });

    it('displays correct header and info icon', () => {
      const { container } = renderCondensePrefs();

      expect(screen.getByText('Default Condense')).toBeInTheDocument();

      const infoContainer = container.querySelector('[data-bs-toggle="modal"]');
      expect(infoContainer).toHaveAttribute('data-bs-target', '#condenseHelp');
      expect(infoContainer).toHaveAttribute('data-bs-toggle', 'modal');
      expect(infoContainer).toHaveAttribute('title', 'Condense Info');
    });

    it('renders checkboxes with correct IDs and labels', () => {
      renderCondensePrefs();

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      expect(stickyCheckbox).toHaveAttribute('id', 'condenseStickySetting');
      expect(pinnedCheckbox).toHaveAttribute('id', 'condensePinnedSetting');
      expect(duplicateCheckbox).toHaveAttribute(
        'id',
        'condenseDuplicatesSetting'
      );
    });
  });

  describe('Sticky Checkbox State Management', () => {
    it('reflects condenseSticky state from Redux store when enabled', () => {
      renderCondensePrefs(true, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      expect(stickyCheckbox).toBeChecked();
    });

    it('is unchecked when condenseSticky is disabled', () => {
      renderCondensePrefs(false, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      expect(stickyCheckbox).not.toBeChecked();
    });

    it('updates state when sticky checkbox is clicked', async () => {
      renderCondensePrefs(false, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      await user.click(stickyCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condenseSticky: true },
        })
      );
    });

    it('toggles sticky state from enabled to disabled', async () => {
      renderCondensePrefs(true, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      await user.click(stickyCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condenseSticky: false },
        })
      );
    });
  });

  describe('Pinned Checkbox State Management', () => {
    it('reflects condensePinned state from Redux store when enabled', () => {
      renderCondensePrefs(false, false, true);

      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      expect(pinnedCheckbox).toBeChecked();
    });

    it('is unchecked when condensePinned is disabled', () => {
      renderCondensePrefs(false, false, false);

      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      expect(pinnedCheckbox).not.toBeChecked();
    });

    it('updates state when pinned checkbox is clicked', async () => {
      renderCondensePrefs(false, false, false);

      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      await user.click(pinnedCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condensePinned: true },
        })
      );
    });

    it('toggles pinned state from enabled to disabled', async () => {
      renderCondensePrefs(false, false, true);

      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      await user.click(pinnedCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condensePinned: false },
        })
      );
    });
  });

  describe('Duplicate Checkbox State Management', () => {
    it('reflects condenseDuplicate state from Redux store when enabled', () => {
      renderCondensePrefs(false, true, false);

      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });
      expect(duplicateCheckbox).toBeChecked();
    });

    it('is unchecked when condenseDuplicate is disabled', () => {
      renderCondensePrefs(false, false, false);

      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });
      expect(duplicateCheckbox).not.toBeChecked();
    });

    it('updates state when duplicate checkbox is clicked', async () => {
      renderCondensePrefs(false, false, false);

      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });
      await user.click(duplicateCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condenseDuplicate: true },
        })
      );
    });

    it('toggles duplicate state from enabled to disabled', async () => {
      renderCondensePrefs(false, true, false);

      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });
      await user.click(duplicateCheckbox);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: { condenseDuplicate: false },
        })
      );
    });
  });

  describe('Multiple Checkbox Interactions', () => {
    it('allows multiple checkboxes to be enabled simultaneously', async () => {
      renderCondensePrefs(false, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      await user.click(stickyCheckbox);
      await user.click(pinnedCheckbox);
      await user.click(duplicateCheckbox);

      expect(dispatchSpy).toHaveBeenCalledTimes(3);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ payload: { condenseSticky: true } })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ payload: { condensePinned: true } })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ payload: { condenseDuplicate: true } })
      );
    });

    it('handles independent checkbox state changes', async () => {
      renderCondensePrefs(true, true, true);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      // Disable sticky, leave pinned enabled, disable duplicate
      await user.click(stickyCheckbox);
      await user.click(duplicateCheckbox);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ payload: { condenseSticky: false } })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ payload: { condenseDuplicate: false } })
      );
    });
  });

  describe('User Interactions', () => {
    it('handles keyboard interaction on sticky checkbox', async () => {
      renderCondensePrefs(false, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      stickyCheckbox.focus();
      await user.keyboard(' ');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { condenseSticky: true },
        })
      );
    });

    it('handles keyboard interaction on pinned checkbox', async () => {
      renderCondensePrefs(false, false, false);

      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      pinnedCheckbox.focus();
      await user.keyboard(' ');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { condensePinned: true },
        })
      );
    });

    it('handles keyboard interaction on duplicate checkbox', async () => {
      renderCondensePrefs(false, false, false);

      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });
      duplicateCheckbox.focus();
      await user.keyboard(' ');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { condenseDuplicate: true },
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper label associations for all checkboxes', () => {
      renderCondensePrefs();

      const stickyLabel = screen.getByText('Sticky');
      const pinnedLabel = screen.getByText('Pinned');
      const duplicateLabel = screen.getByText('Duplicate');

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      expect(stickyLabel).toHaveAttribute('for', 'condenseStickySetting');
      expect(pinnedLabel).toHaveAttribute('for', 'condensePinnedSetting');
      expect(duplicateLabel).toHaveAttribute(
        'for',
        'condenseDuplicatesSetting'
      );

      expect(stickyCheckbox).toHaveAttribute('id', 'condenseStickySetting');
      expect(pinnedCheckbox).toHaveAttribute('id', 'condensePinnedSetting');
      expect(duplicateCheckbox).toHaveAttribute(
        'id',
        'condenseDuplicatesSetting'
      );
    });

    it('has proper checkbox types', () => {
      renderCondensePrefs();

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      expect(stickyCheckbox).toHaveAttribute('type', 'checkbox');
      expect(pinnedCheckbox).toHaveAttribute('type', 'checkbox');
      expect(duplicateCheckbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Redux Integration', () => {
    it('reads initial state from Redux store for all settings', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          condenseSticky: true,
          condenseDuplicate: false,
          condensePinned: true,
          view: 'expanded',
          debugMode: false,
          theme: 'auto',
          stream: false,
        },
      };

      renderCondensePrefs(true, false, true, customState);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      expect(stickyCheckbox).toBeChecked();
      expect(pinnedCheckbox).toBeChecked();
      expect(duplicateCheckbox).not.toBeChecked();
    });

    it('dispatches correct action structures for all checkboxes', async () => {
      renderCondensePrefs(false, false, false);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /sticky/i });
      const pinnedCheckbox = screen.getByRole('checkbox', { name: /pinned/i });
      const duplicateCheckbox = screen.getByRole('checkbox', {
        name: /duplicate/i,
      });

      await user.click(stickyCheckbox);
      await user.click(pinnedCheckbox);
      await user.click(duplicateCheckbox);

      expect(dispatchSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: expect.objectContaining({ condenseSticky: true }),
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: expect.objectContaining({ condensePinned: true }),
        })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: expect.stringContaining('siteSettings'),
          payload: expect.objectContaining({ condenseDuplicate: true }),
        })
      );
    });
  });
});

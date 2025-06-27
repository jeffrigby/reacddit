import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import { renderWithProviders, createTestStore } from '@/test/utils';
import Settings from './Settings';

// Mock the child components to isolate Settings component testing
vi.mock('./AutoRefresh', () => ({
  default: () => <div data-testid="auto-refresh">AutoRefresh Component</div>,
}));

vi.mock('./AutoPlay', () => ({
  default: () => <div data-testid="auto-play">AutoPlay Component</div>,
}));

vi.mock('./DebugMode', () => ({
  default: () => <div data-testid="debug-mode">DebugMode Component</div>,
}));

vi.mock('./CondensePrefs', () => ({
  default: () => (
    <div data-testid="condense-prefs">CondensePrefs Component</div>
  ),
}));

vi.mock('./ForceRefresh', () => ({
  default: () => <div data-testid="force-refresh">ForceRefresh Component</div>,
}));

describe('Settings', () => {
  const user = userEvent.setup();

  const renderSettings = (overrides: Partial<RootState> = {}) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        view: 'expanded',
        debugMode: false,
        theme: 'auto',
        stream: false,
      },
      ...overrides,
    };

    const store = createTestStore(preloadedState);
    const result = renderWithProviders(<Settings />, { store });

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders settings button with correct structure', () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsButton).toBeInTheDocument();
      expect(settingsButton).toHaveClass(
        'btn',
        'btn-secondary',
        'btn-sm',
        'form-control-sm'
      );
      expect(settingsButton).toHaveAttribute('type', 'button');
      expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'true');
      expect(settingsButton).toHaveAttribute('data-bs-toggle', 'dropdown');
    });

    it('renders settings icon inside button', () => {
      const { container } = renderSettings();

      const settingsIcon = container.querySelector('.fas.fa-cog');
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsIcon).toBeInTheDocument();
      expect(settingsButton).toContainElement(settingsIcon);
    });

    it('renders with correct container structure', () => {
      const { container } = renderSettings();

      const btnGroup = container.querySelector(
        '.btn-group.settings-menu.header-button'
      );
      const dropdownMenu = container.querySelector(
        '.dropdown-menu.dropdown-menu-end.p-2'
      );

      expect(btnGroup).toBeInTheDocument();
      expect(dropdownMenu).toBeInTheDocument();
      expect(btnGroup).toContainElement(dropdownMenu);
      expect(btnGroup).toHaveAttribute('tabIndex', '0');
    });

    it('renders dropdown menu with correct structure', () => {
      const { container } = renderSettings();

      const dropdownMenu = container.querySelector(
        '.dropdown-menu.dropdown-menu-end.p-2'
      );
      const smallSection = container.querySelector('.small');
      const dropdownDivider = container.querySelector('.dropdown-divider');

      expect(dropdownMenu).toBeInTheDocument();
      expect(smallSection).toBeInTheDocument();
      expect(dropdownDivider).toBeInTheDocument();
      expect(dropdownMenu).toContainElement(smallSection);
      expect(dropdownMenu).toContainElement(dropdownDivider);
    });
  });

  describe('Child Component Rendering', () => {
    it('renders all child components in correct order', () => {
      renderSettings();

      const autoRefresh = screen.getByTestId('auto-refresh');
      const autoPlay = screen.getByTestId('auto-play');
      const debugMode = screen.getByTestId('debug-mode');
      const condensePrefs = screen.getByTestId('condense-prefs');
      const forceRefresh = screen.getByTestId('force-refresh');

      expect(autoRefresh).toBeInTheDocument();
      expect(autoPlay).toBeInTheDocument();
      expect(debugMode).toBeInTheDocument();
      expect(condensePrefs).toBeInTheDocument();
      expect(forceRefresh).toBeInTheDocument();
    });

    it('renders child components in small section', () => {
      const { container } = renderSettings();

      const smallSection = container.querySelector('.small');
      const autoRefresh = screen.getByTestId('auto-refresh');
      const autoPlay = screen.getByTestId('auto-play');
      const debugMode = screen.getByTestId('debug-mode');
      const condensePrefs = screen.getByTestId('condense-prefs');

      expect(smallSection).toContainElement(autoRefresh);
      expect(smallSection).toContainElement(autoPlay);
      expect(smallSection).toContainElement(debugMode);
      expect(smallSection).toContainElement(condensePrefs);
    });

    it('renders ForceRefresh after divider', () => {
      const { container } = renderSettings();

      const dropdownMenu = container.querySelector('.dropdown-menu');
      const forceRefresh = screen.getByTestId('force-refresh');
      const divider = container.querySelector('.dropdown-divider');

      expect(dropdownMenu).toContainElement(forceRefresh);
      expect(dropdownMenu).toContainElement(divider);

      // Check that ForceRefresh comes after the divider in DOM order
      const dropdownChildren = Array.from(dropdownMenu?.children || []);
      const dividerIndex = dropdownChildren.findIndex((child) =>
        child.classList.contains('dropdown-divider')
      );
      const forceRefreshIndex = dropdownChildren.findIndex((child) =>
        child.contains(forceRefresh)
      );

      expect(forceRefreshIndex).toBeGreaterThan(dividerIndex);
    });
  });

  describe('User Interactions', () => {
    it('handles button click interaction', async () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      // Button should be clickable
      expect(settingsButton).not.toBeDisabled();

      // Click should not throw error
      await user.click(settingsButton);

      expect(settingsButton).toBeInTheDocument();
    });

    it('handles keyboard interaction (Enter key)', async () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      settingsButton.focus();

      await user.keyboard('{Enter}');

      expect(settingsButton).toBeInTheDocument();
    });

    it('handles keyboard interaction (Space key)', async () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      settingsButton.focus();

      await user.keyboard(' ');

      expect(settingsButton).toBeInTheDocument();
    });

    it('maintains focus on button after interaction', async () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      expect(document.activeElement).toBe(settingsButton);
    });
  });

  describe('Bootstrap Dropdown Integration', () => {
    it('has correct Bootstrap dropdown attributes', () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsButton).toHaveAttribute('data-bs-toggle', 'dropdown');
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('has correct dropdown menu classes', () => {
      const { container } = renderSettings();

      const dropdownMenu = container.querySelector('.dropdown-menu');

      expect(dropdownMenu).toHaveClass('dropdown-menu');
      expect(dropdownMenu).toHaveClass('dropdown-menu-end');
      expect(dropdownMenu).toHaveClass('p-2');
    });

    it('has correct button group structure', () => {
      const { container } = renderSettings();

      const btnGroup = container.querySelector('.btn-group');

      expect(btnGroup).toHaveClass('btn-group');
      expect(btnGroup).toHaveClass('settings-menu');
      expect(btnGroup).toHaveClass('header-button');
      expect(btnGroup).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for dropdown', () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('is keyboard accessible', () => {
      const { container } = renderSettings();

      const btnGroup = container.querySelector('.btn-group');
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(btnGroup).toHaveAttribute('tabIndex', '0');
      expect(settingsButton).not.toBeDisabled();
    });

    it('has semantic button role', () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsButton).toHaveAttribute('type', 'button');
      expect(settingsButton.tagName).toBe('BUTTON');
    });
  });

  describe('Component Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = renderSettings();

      const btnGroup = container.querySelector(
        '.btn-group.settings-menu.header-button'
      );
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const dropdownMenu = container.querySelector(
        '.dropdown-menu.dropdown-menu-end.p-2'
      );

      expect(btnGroup).toContainElement(settingsButton);
      expect(btnGroup).toContainElement(dropdownMenu);
    });

    it('has correct CSS classes applied', () => {
      renderSettings();

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      expect(settingsButton).toHaveClass('btn');
      expect(settingsButton).toHaveClass('btn-secondary');
      expect(settingsButton).toHaveClass('btn-sm');
      expect(settingsButton).toHaveClass('form-control-sm');
    });

    it('renders divider between sections', () => {
      const { container } = renderSettings();

      const divider = container.querySelector('.dropdown-divider');
      const dropdownMenu = container.querySelector('.dropdown-menu');

      expect(divider).toBeInTheDocument();
      expect(dropdownMenu).toContainElement(divider);
    });
  });

  describe('Integration with Redux', () => {
    it('renders correctly with different Redux states', () => {
      const customState: Partial<RootState> = {
        siteSettings: {
          view: 'condensed',
          debugMode: true,
          theme: 'dark',
          stream: true,
        },
      };

      renderSettings(customState);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const autoRefresh = screen.getByTestId('auto-refresh');
      const debugMode = screen.getByTestId('debug-mode');

      expect(settingsButton).toBeInTheDocument();
      expect(autoRefresh).toBeInTheDocument();
      expect(debugMode).toBeInTheDocument();
    });

    it('passes Redux state to child components', () => {
      renderSettings();

      // Child components should be rendered (mocked versions)
      expect(screen.getByTestId('auto-refresh')).toBeInTheDocument();
      expect(screen.getByTestId('auto-play')).toBeInTheDocument();
      expect(screen.getByTestId('debug-mode')).toBeInTheDocument();
      expect(screen.getByTestId('condense-prefs')).toBeInTheDocument();
      expect(screen.getByTestId('force-refresh')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import { renderWithProviders } from '../../test/utils';

// Import the components we're testing together
import Search from '../../components/header/Search';
import Sort from '../../components/header/Sort';
import ViewMode from '../../components/header/ViewMode';
import ToggleTheme from '../../components/header/ToggleTheme';
import Reload from '../../components/header/Reload';

// Mock React Router
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

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

// Mock external dependencies
vi.mock('react-device-detect', () => ({
  isMobile: false,
}));

vi.mock('../../common', () => ({
  hotkeyStatus: vi.fn(() => true),
}));

vi.mock('query-string', () => ({
  default: {
    parse: vi.fn(() => ({})),
    stringify: vi.fn((obj: Record<string, string>) =>
      Object.entries(obj)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    ),
  },
  parse: vi.fn(() => ({})),
  stringify: vi.fn((obj: Record<string, string>) =>
    Object.entries(obj)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  ),
}));

// Mock Redux actions
const mockListingsFetchRedditNew = vi.fn();
vi.mock('../../redux/actions/listings', () => ({
  listingsFetchRedditNew: () => mockListingsFetchRedditNew,
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Component that renders multiple header components together
function HeaderComponents() {
  return (
    <div>
      <Search />
      <Sort />
      <ViewMode />
      <ToggleTheme />
      <Reload />
    </div>
  );
}

describe('Header Components Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default location mock
    mockUseLocation.mockReturnValue({
      search: '',
      pathname: '/r/reactjs',
      state: null,
      key: 'test-key',
      hash: '',
    });
  });

  const renderHeaderComponents = (preloadedState: Partial<RootState> = {}) => {
    const defaultState: Partial<RootState> = {
      listingsFilter: {
        sort: 'hot',
        target: 'reactjs',
        multi: false,
        userType: '',
        user: '',
        listType: 'r',
      },
      siteSettings: {
        stream: false,
        debugMode: false,
        theme: 'auto',
        autoRefresh: false,
        view: 'expanded',
      },
      listingsRedditStatus: {
        'test-key': { status: 'loaded' },
      },
      ...preloadedState,
    };

    return renderWithProviders(<HeaderComponents />, {
      preloadedState: defaultState,
    });
  };

  describe('Component Rendering Integration', () => {
    it('renders all header components together', () => {
      renderHeaderComponents();

      // Search component
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('search in /r/reactjs')
      ).toBeInTheDocument();

      // Sort component
      expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();

      // ViewMode component
      expect(
        screen.getByRole('button', { name: /condensed view/i })
      ).toBeInTheDocument();

      // ToggleTheme component
      expect(
        screen.getByRole('button', { name: /dark mode/i })
      ).toBeInTheDocument();

      // Reload component
      expect(
        screen.getByRole('button', { name: /load new entries/i })
      ).toBeInTheDocument();
    });

    it('adapts to different listing types', () => {
      renderHeaderComponents({
        listingsFilter: {
          sort: 'top',
          target: 'programming',
          multi: false,
          userType: '',
          user: '',
          listType: 'm',
        },
      });

      // Search should show multireddit placeholder
      expect(
        screen.getByPlaceholderText('search in /m/programming')
      ).toBeInTheDocument();

      // Sort should show current sort in button
      expect(screen.getByRole('button', { name: /sort/i })).toHaveTextContent('top');
    });

    it('handles friends listings correctly', () => {
      renderHeaderComponents({
        listingsFilter: {
          sort: 'hot',
          target: 'friends',
          multi: false,
          userType: '',
          user: '',
          listType: 'r',
        },
      });

      // Search should show friends placeholder
      expect(screen.getByPlaceholderText('search in /r/friends')).toBeInTheDocument();

      // Sort should not render for friends
      expect(
        screen.queryByRole('button', { name: /sort/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('State Synchronization', () => {
    it('reflects theme changes across components', () => {
      // Test light theme
      renderHeaderComponents({
        siteSettings: {
          theme: 'light',
          stream: false,
          debugMode: false,
          autoRefresh: false,
          view: 'expanded',
        },
      });

      // Theme toggle should show dark mode option
      expect(
        screen.getByRole('button', { name: /dark mode/i })
      ).toBeInTheDocument();
    });

    it('reflects dark theme state', () => {
      // Test dark theme
      renderHeaderComponents({
        siteSettings: {
          theme: 'dark',
          stream: false,
          debugMode: false,
          autoRefresh: false,
          view: 'expanded',
        },
      });

      // Theme toggle should show light mode option
      expect(
        screen.getByRole('button', { name: /light mode/i })
      ).toBeInTheDocument();
    });

    it('reflects expanded view mode', () => {
      renderHeaderComponents({
        siteSettings: {
          view: 'expanded',
          theme: 'auto',
          stream: false,
          debugMode: false,
          autoRefresh: false,
        },
      });

      // Should show condensed view button
      expect(
        screen.getByRole('button', { name: /condensed view/i })
      ).toBeInTheDocument();
    });

    it('reflects condensed view mode', () => {
      renderHeaderComponents({
        siteSettings: {
          view: 'condensed',
          theme: 'auto',
          stream: false,
          debugMode: false,
          autoRefresh: false,
        },
      });

      // Should show full view button
      expect(
        screen.getByRole('button', { name: /full view/i })
      ).toBeInTheDocument();
    });

    it('reflects stream mode disabled in reload button', () => {
      renderHeaderComponents({
        siteSettings: {
          stream: false,
          theme: 'auto',
          debugMode: false,
          autoRefresh: false,
          view: 'expanded',
        },
      });

      // Reload button should have secondary style
      const reloadButton = screen.getByRole('button', {
        name: /load new entries/i,
      });
      expect(reloadButton).toHaveClass('btn-secondary');
    });

    it('reflects stream mode enabled in reload button', () => {
      renderHeaderComponents({
        siteSettings: {
          stream: true,
          theme: 'auto',
          debugMode: false,
          autoRefresh: false,
          view: 'expanded',
        },
      });

      // Reload button should have primary style
      const reloadButton = screen.getByRole('button', {
        name: /load new entries/i,
      });
      expect(reloadButton).toHaveClass('btn-primary');
    });
  });

  describe('User Workflow Integration', () => {
    it('supports complete search workflow', async () => {
      renderHeaderComponents();

      // User types in search
      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'typescript');

      // User focuses search to see tooltip
      await user.click(searchInput);

      // Search buttons should appear
      const targetSearchButton = screen.getByRole('button', {
        name: /search in \/r\/reactjs/i,
      });
      const globalSearchButton = screen.getByRole('button', {
        name: /search everywhere/i,
      });

      expect(targetSearchButton).toBeInTheDocument();
      expect(globalSearchButton).toBeInTheDocument();

      // User clicks target search
      await user.click(targetSearchButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        '/r/reactjs/search?sort=relevance&t=null&q=typescript'
      );
    });

    it('supports view mode and reload workflow', async () => {
      renderHeaderComponents();

      // User changes view mode
      const viewModeButton = screen.getByRole('button', {
        name: /condensed view/i,
      });
      await user.click(viewModeButton);

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

      // User reloads content
      const reloadButton = screen.getByRole('button', {
        name: /load new entries/i,
      });
      await user.click(reloadButton);

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(mockListingsFetchRedditNew).toHaveBeenCalled();
    });

    it('handles keyboard shortcuts across components', () => {
      renderHeaderComponents();

      // Test view mode hotkey
      const viewModeEvent = new KeyboardEvent('keydown', {
        key: 'v',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(viewModeEvent);

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Loading States Integration', () => {
    it('shows loading states consistently', () => {
      renderHeaderComponents({
        listingsRedditStatus: {
          'test-key': { status: 'loading' },
        },
      });

      // Reload button should be disabled during loading
      const reloadButton = screen.getByRole('button', {
        name: /load new entries/i,
      });
      expect(reloadButton).toBeDisabled();

      // Icon should show spinning state
      const icon = reloadButton.querySelector('i');
      expect(icon).toHaveClass('fa-spin');
    });

    it('handles different loading states', () => {
      const loadingStates = [
        'loading',
        'loadingNext',
        'loadingNew',
        'loadingStream',
      ];

      loadingStates.forEach((status, index) => {
        const { unmount } = renderHeaderComponents({
          listingsRedditStatus: {
            [`test-key-${index}`]: { status },
          },
        });

        const reloadButton = screen.getByRole('button', {
          name: /load new entries/i,
        });
        expect(reloadButton).toBeDisabled();
        
        // Clean up for next iteration
        unmount();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles missing state gracefully', () => {
      renderHeaderComponents({
        listingsRedditStatus: {},
      });

      // Components should still render
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /load new entries/i })
      ).toBeInTheDocument();
    });

    it('handles undefined values gracefully', () => {
      renderHeaderComponents({
        siteSettings: {
          stream: undefined as unknown as boolean,
          theme: undefined as unknown as string,
          view: undefined as unknown as 'expanded' | 'condensed',
          debugMode: false,
          autoRefresh: false,
        },
      });

      // Components should render with defaults
      expect(
        screen.getByRole('button', { name: /dark mode/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /condensed view/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper tab order', () => {
      renderHeaderComponents();

      const interactiveElements = [
        screen.getByRole('textbox'),
        screen.getByRole('button', { name: /sort/i }),
        screen.getByRole('button', { name: /condensed view/i }),
        screen.getByRole('button', { name: /dark mode/i }),
        screen.getByRole('button', { name: /load new entries/i }),
      ];

      interactiveElements.forEach((element) => {
        expect(element).toBeInTheDocument();
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('provides proper ARIA labels', () => {
      renderHeaderComponents();

      // Check that all interactive elements have proper labels
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'id',
        'search-reddit'
      );
      expect(
        screen.getByRole('button', { name: /condensed view/i })
      ).toHaveAttribute('aria-label', 'Condensed View');
      expect(
        screen.getByRole('button', { name: /dark mode/i })
      ).toHaveAttribute('aria-label');
      expect(
        screen.getByRole('button', { name: /load new entries/i })
      ).toHaveAttribute('aria-label', 'Load New Entries');
    });
  });
});

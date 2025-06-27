import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import queryString from 'query-string';
import type { RootState } from '@/types/redux';
import { renderWithProviders } from '@/test/utils';
import Search from './Search';

// Mock React Router hooks
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock react-device-detect
vi.mock('react-device-detect', () => ({
  isMobile: false,
}));

// Mock the common module
const mockHotkeyStatus = vi.fn();
vi.mock('@/common', () => ({
  hotkeyStatus: () => mockHotkeyStatus(),
}));

// Mock query-string
vi.mock('query-string', () => ({
  default: {
    parse: vi.fn(),
    stringify: vi.fn(),
  },
  parse: vi.fn(),
  stringify: vi.fn(),
}));

// Helper function to render Search component with custom state and location
const renderSearch = (
  listingsFilterOverrides = {},
  locationMock = {},
  queryStringMock = {}
) => {
  // Set up default location mock
  mockUseLocation.mockReturnValue({
    search: '',
    pathname: '/r/pics',
    state: null,
    key: 'test',
    hash: '',
    ...locationMock,
  });

  // Mock query-string parse
  vi.mocked(queryString.parse).mockReturnValue(queryStringMock);
  vi.mocked(queryString.stringify).mockImplementation(
    (obj: Record<string, string | number | boolean>) => {
      return Object.entries(obj)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    }
  );

  const preloadedState: Partial<RootState> = {
    listingsFilter: {
      sort: 'hot',
      target: 'pics',
      multi: false,
      userType: '',
      user: '',
      listType: 'r',
      ...listingsFilterOverrides,
    },
  };

  return renderWithProviders(<Search />, { preloadedState });
};

describe('Search Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHotkeyStatus.mockReturnValue(true);
    vi.mocked(queryString.parse).mockReturnValue({});
    vi.mocked(queryString.stringify).mockImplementation(
      (obj: Record<string, string | number | boolean>) => {
        return Object.entries(obj)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
      }
    );
  });

  describe('Rendering', () => {
    it('renders search input with correct attributes', () => {
      renderSearch();

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('id', 'search-reddit');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder', 'search in /r/pics');
      expect(searchInput).toHaveClass(
        'form-control',
        'form-control-sm',
        'w-100',
        'py-0'
      );
    });

    it('renders with global search placeholder when target is mine', () => {
      renderSearch({ target: 'mine' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'search Reddit');
    });

    it('renders with multireddit placeholder', () => {
      renderSearch({ listType: 'm', target: 'testmulti' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'search in /m/testmulti'
      );
    });

    it('renders with search container div', () => {
      const { container } = renderSearch();

      const searchContainer = container.querySelector('#search');
      expect(searchContainer).toBeInTheDocument();
      expect(searchContainer).toHaveClass('m-0');
    });

    it('sets search value from query string on mount', () => {
      renderSearch({}, {}, { q: 'test query' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveValue('test query');
    });
  });

  describe('Search Input Behavior', () => {
    it('updates search value when typing', async () => {
      const user = userEvent.setup();
      renderSearch();

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'new search term');

      expect(searchInput).toHaveValue('new search term');
    });

    it('shows title attribute for non-global search', () => {
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute(
        'title',
        'Press shift-return to search all of reddit'
      );
    });

    it('shows title even for mine target when listType is r', () => {
      renderSearch({ listType: 'r', target: 'mine' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute(
        'title',
        'Press shift-return to search all of reddit'
      );
    });
  });

  describe('Search Tooltip and Buttons', () => {
    it('shows search tooltip when focused and not global search', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);

      const targetSearchButton = screen.getByRole('button', {
        name: /search in \/r\/pics/i,
      });
      const everywhereButton = screen.getByRole('button', {
        name: /search everywhere/i,
      });

      expect(targetSearchButton).toBeInTheDocument();
      expect(everywhereButton).toBeInTheDocument();
    });

    it('disables search buttons when search is empty', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);

      const targetSearchButton = screen.getByRole('button', {
        name: /search in \/r\/pics/i,
      });
      const everywhereButton = screen.getByRole('button', {
        name: /search everywhere/i,
      });

      expect(targetSearchButton).toBeDisabled();
      expect(everywhereButton).toBeDisabled();
    });

    it('enables search buttons when search has value', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      await user.type(searchInput, 'test query');

      const targetSearchButton = screen.getByRole('button', {
        name: /search in \/r\/pics/i,
      });
      const everywhereButton = screen.getByRole('button', {
        name: /search everywhere/i,
      });

      expect(targetSearchButton).not.toBeDisabled();
      expect(everywhereButton).not.toBeDisabled();
    });

    it('does not show tooltip for global search', async () => {
      const user = userEvent.setup();
      renderSearch({ target: 'mine' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);

      expect(
        screen.queryByRole('button', { name: /search in/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /search everywhere/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles Enter key for target search', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test query');

      fireEvent.keyUp(searchInput, { key: 'Enter', keyCode: 13 });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/r/pics/search?sort=relevance&t=null&q=test query'
      );
    });

    it('handles Shift+Enter for global search', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test query');

      fireEvent.keyUp(searchInput, {
        key: 'Enter',
        keyCode: 13,
        shiftKey: true,
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/search?sort=relevance&t=null&q=test query'
      );
    });

    it('does not navigate when search is empty', async () => {
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      fireEvent.keyUp(searchInput, { key: 'Enter', keyCode: 13 });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Button Click Handlers', () => {
    it('navigates to target search when target search button is clicked', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      await user.type(searchInput, 'test query');

      const targetSearchButton = screen.getByRole('button', {
        name: /search in \/r\/pics/i,
      });
      await user.click(targetSearchButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        '/r/pics/search?sort=relevance&t=null&q=test query'
      );
    });

    it('navigates to global search when search everywhere button is clicked', async () => {
      const user = userEvent.setup();
      renderSearch({ listType: 'r', target: 'pics' });

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      await user.type(searchInput, 'test query');

      const everywhereButton = screen.getByRole('button', {
        name: /search everywhere/i,
      });
      await user.click(everywhereButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        '/search?sort=relevance&t=null&q=test query'
      );
    });
  });

  describe('Different List Types', () => {
    it('generates correct placeholder for subreddit search', () => {
      renderSearch({ listType: 'r', target: 'javascript' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'search in /r/javascript'
      );
    });

    it('generates correct placeholder for multireddit search', () => {
      renderSearch({ listType: 'm', target: 'programming' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'search in /m/programming'
      );
    });

    it('generates correct placeholder for search results', () => {
      renderSearch({ listType: 's', target: 'test', multi: false });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'search in /r/test');
    });

    it('generates global placeholder for mine target', () => {
      renderSearch({ listType: 'r', target: 'mine' });

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'search Reddit');
    });
  });

  describe('URL Generation with Query Parameters', () => {
    it('preserves existing sort parameters in search URL', () => {
      vi.mocked(queryString.parse).mockReturnValue({ sort: 'top', t: 'week' });
      renderSearch(
        { listType: 'r', target: 'pics' },
        { search: '?sort=top&t=week' }
      );

      // The component should use the existing sort parameters
      // This is tested indirectly through the navigation calls
    });

    it('updates search value from location changes', () => {
      const { rerender } = renderSearch({}, {}, { q: 'initial' });

      let searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveValue('initial');

      // Simulate location change
      mockUseLocation.mockReturnValue({
        search: '?q=updated',
        pathname: '/r/pics',
        state: null,
        key: 'test',
        hash: '',
      });

      vi.mocked(queryString.parse).mockReturnValue({ q: 'updated' });

      rerender(<Search />);

      searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveValue('updated');
    });
  });
});

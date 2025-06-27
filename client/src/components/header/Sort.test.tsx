import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { RootState } from '@/types/redux';
import { renderWithProviders } from '@/test/utils';
import Sort from './Sort';

// Mock React Router hooks and components
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

// Mock the common module
vi.mock('@/common', () => ({
  hotkeyStatus: vi.fn(() => true),
}));

// Helper function to render Sort component with custom state and location
const renderSort = (listingsFilterOverrides = {}, locationMock = {}) => {
  // Set up default location mock
  mockUseLocation.mockReturnValue({
    search: '',
    pathname: '/r/pics',
    state: null,
    key: 'test',
    hash: '',
    ...locationMock,
  });

  const preloadedState: Partial<RootState> = {
    listingsFilter: {
      sort: 'hot',
      target: 'pics',
      multi: false,
      userType: '',
      user: '',
      listType: 'r',
      qs: '',
      postName: '',
      comment: '',
      ...listingsFilterOverrides,
    },
  };

  return renderWithProviders(<Sort />, { preloadedState });
};

describe('Sort Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sort button for subreddit listings', () => {
    renderSort();

    const sortButton = screen.getByRole('button', { name: /sort/i });
    expect(sortButton).toBeInTheDocument();
    expect(sortButton).toHaveTextContent('hot');
  });

  it('does not render for friends listings', () => {
    const { container } = renderSort({ target: 'friends' });
    expect(container.firstChild).toBeNull();
  });

  it('does not render for duplicates listings', () => {
    const { container } = renderSort({ listType: 'duplicates' });
    expect(container.firstChild).toBeNull();
  });

  it('shows correct sort for search results with query string parsing', () => {
    renderSort(
      {
        listType: 's',
        sort: 'relevance',
      },
      { search: '?q=test&sort=top' }
    );

    const sortButton = screen.getByRole('button', { name: /sort/i });
    expect(sortButton).toBeInTheDocument();
    // For search results, the current sort comes from query string, not Redux state
    expect(sortButton).toHaveTextContent('top');
  });

  it('shows correct sort for top listings', () => {
    renderSort({ sort: 'top' });

    const sortButton = screen.getByRole('button', { name: /sort/i });
    expect(sortButton).toHaveTextContent('top');
  });

  it('shows default sort when no sort specified', () => {
    renderSort({ sort: undefined });

    const sortButton = screen.getByRole('button', { name: /sort/i });
    expect(sortButton).toHaveTextContent('hot');
  });
});

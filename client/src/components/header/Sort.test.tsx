import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { RootState } from '@/types/redux';
import { renderWithProviders } from '@/test/utils';
import {
  mockNavigate,
  mockUseLocation,
  mockHotkeyStatus,
} from '@/test/globalMocks';
import Sort from './Sort';

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
    // Global mocks are automatically cleared
    mockHotkeyStatus.mockReturnValue(true);
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

  it('shows correct sort for search results', () => {
    renderSort(
      {
        listType: 's',
        sort: 'relevance',
      },
      { search: '?q=test&sort=top' }
    );

    const sortButton = screen.getByRole('button', { name: /sort/i });
    expect(sortButton).toBeInTheDocument();
    // For search results, the current sort comes from Redux state
    expect(sortButton).toHaveTextContent('relevance');
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

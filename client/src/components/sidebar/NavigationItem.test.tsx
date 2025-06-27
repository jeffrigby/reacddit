import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import type { SubredditData } from '@/types/redditApi';
import { renderWithProviders } from '@/test/utils';
import { mockQueryString, mockFormatDistanceToNow } from '@/test/globalMocks';
import NavigationItem from './NavigationItem';

// Component-specific mocks
vi.mock('./navHelpers', () => ({
  getDiffClassName: vi.fn((lastUpdated: number, trigger: boolean) => {
    if (!lastUpdated) {
      return '';
    }
    const now = Date.now() / 1000;
    const diff = now - lastUpdated;
    let className = '';

    if (diff > 15552000) {
      className = 'sub-dead';
    } else if (diff > 7776000) {
      className = 'sub-stale';
    } else if (diff < 1800) {
      className = 'sub-new';
    } else if (diff < 86400) {
      className = 'sub-today';
    }

    return trigger ? `${className} mark trigger` : className;
  }),
}));

vi.mock('./NavigationGenericNavItem', () => ({
  default: vi.fn(({ text, to, title, classes, badge, id, noLi }) => (
    <a
      className={classes}
      data-badge={badge}
      data-id={id}
      data-no-li={noLi}
      data-testid="nav-item"
      href={to}
      title={title}
    >
      {text}
    </a>
  )),
}));

vi.mock('./SubFavorite', () => ({
  default: vi.fn(({ isFavorite, srName }) => (
    <button
      data-is-favorite={isFavorite}
      data-sr-name={srName}
      data-testid="sub-favorite"
    >
      {isFavorite ? '★' : '☆'}
    </button>
  )),
}));


// Helper function to create test subreddit data
const createTestSubreddit = (
  overrides: Partial<SubredditData> = {}
): SubredditData => ({
  id: 't5_test',
  name: 't5_test',
  display_name: 'test',
  display_name_prefixed: 'r/test',
  title: 'Test Subreddit',
  description: 'A test subreddit',
  description_html: '<p>A test subreddit</p>',
  public_description: 'Public description',
  subscribers: 1000,
  created: 1234567890,
  created_utc: 1234567890,
  lang: 'en',
  over18: false,
  subreddit_type: 'public',
  header_img: null,
  header_size: null,
  icon_img: null,
  url: '/r/test',
  user_is_moderator: false,
  user_is_contributor: false,
  user_is_subscriber: false,
  user_is_banned: false,
  user_is_muted: false,
  user_has_favorited: false,
  ...overrides,
});

// Helper function to render NavigationItem with custom state
const renderNavigationItem = (
  item: SubredditData,
  trigger: boolean,
  stateOverrides: Partial<RootState> = {}
) => {
  const preloadedState: Partial<RootState> = {
    listingsFilter: {
      sort: 'hot',
      target: '',
      multi: false,
      userType: '',
      user: '',
      listType: 'r',
    },
    redditMe: {
      me: {
        name: 'testuser',
        id: 't2_testuser',
        is_employee: false,
        is_friend: false,
        is_mod: false,
        is_gold: false,
        created: 1234567890,
        created_utc: 1234567890,
        link_karma: 100,
        comment_karma: 200,
        icon_img: '',
        has_verified_email: true,
      },
      loading: false,
      error: null,
    },
    lastUpdated: {},
    ...stateOverrides,
  };

  return renderWithProviders(<NavigationItem item={item} trigger={trigger} />, {
    preloadedState,
  });
};

describe('NavigationItem Component', () => {
  beforeEach(() => {
    // Global mocks are automatically reset
    // Set up the default formatDistanceToNow behavior for this test suite
    mockFormatDistanceToNow.mockImplementation((date: number) => {
      const seconds = Math.floor((Date.now() - date) / 1000);
      if (seconds < 60) return 'less than a minute';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
      return `${Math.floor(seconds / 86400)} days`;
    });
  });

  describe('Rendering', () => {
    it('renders navigation item with display name', () => {
      const item = createTestSubreddit({ display_name: 'programming' });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveTextContent('programming');
    });

    it('renders with correct href for subreddit', () => {
      const item = createTestSubreddit({ url: '/r/javascript' });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/javascript/hot');
    });

    it('renders with correct href for user subreddit', () => {
      const item = createTestSubreddit({
        subreddit_type: 'user',
        url: '/u/testuser',
      });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/u/testuser/posts/hot');
    });

    it('includes sort parameter in href when applicable', () => {
      const item = createTestSubreddit({ url: '/r/test' });
      renderNavigationItem(item, false, {
        listingsFilter: {
          sort: 'top',
          target: '',
          multi: false,
          userType: '',
          user: '',
          listType: 'r',
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/test/top');
    });

    it('includes time parameter for top and controversial sorts', () => {
      const item = createTestSubreddit({ url: '/r/test' });

      // Mock query string to return t=week
      mockQueryString.parse.mockReturnValue({ t: 'week' });

      renderNavigationItem(item, false, {
        listingsFilter: {
          sort: 'top',
          target: '',
          multi: false,
          userType: '',
          user: '',
          listType: 'r',
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/test/top?t=week');
    });

    it('strips trailing slashes from href', () => {
      const item = createTestSubreddit({ url: '/r/test/' });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/test/hot');
    });
  });

  describe('Last Updated Display', () => {
    it('shows time ago in title when lastUpdated exists', () => {
      const item = createTestSubreddit({ title: 'Test Sub' });
      const lastUpdated = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      renderNavigationItem(item, false, {
        lastUpdated: {
          t5_test: { lastPost: lastUpdated },
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute(
        'title',
        'Test Sub - updated 1 hours ago'
      );
    });

    it('shows only title when no lastUpdated', () => {
      const item = createTestSubreddit({ title: 'Test Sub' });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('title', 'Test Sub');
    });

    it('shows "New" badge for recently updated subreddits', () => {
      const item = createTestSubreddit();
      const lastUpdated = Math.floor(Date.now() / 1000) - 900; // 15 minutes ago

      renderNavigationItem(item, false, {
        lastUpdated: {
          t5_test: { lastPost: lastUpdated },
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('data-badge', 'New');
      expect(navItem).toHaveAttribute('class', 'sub-new');
    });

    it('does not show badge for older updates', () => {
      const item = createTestSubreddit();
      const lastUpdated = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      renderNavigationItem(item, false, {
        lastUpdated: {
          t5_test: { lastPost: lastUpdated },
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).not.toHaveAttribute('data-badge', 'New');
    });
  });

  describe('Favorite Functionality', () => {
    it('shows favorite button when user is logged in and favorite status exists', () => {
      const item = createTestSubreddit({
        user_has_favorited: true,
        display_name: 'test',
      });
      renderNavigationItem(item, false);

      const favoriteButton = screen.getByTestId('sub-favorite');
      expect(favoriteButton).toBeInTheDocument();
      expect(favoriteButton).toHaveAttribute('data-is-favorite', 'true');
      expect(favoriteButton).toHaveAttribute('data-sr-name', 'test');
    });

    it('shows unfavorited state correctly', () => {
      const item = createTestSubreddit({
        user_has_favorited: false,
        display_name: 'test',
      });
      renderNavigationItem(item, false);

      const favoriteButton = screen.getByTestId('sub-favorite');
      expect(favoriteButton).toHaveAttribute('data-is-favorite', 'false');
    });

    it('does not show favorite button when user is not logged in', () => {
      const item = createTestSubreddit({ user_has_favorited: true });
      renderNavigationItem(item, false, {
        redditMe: {
          me: {
            name: '',
            id: '',
            is_employee: false,
            is_friend: false,
            is_mod: false,
            is_gold: false,
            created: 0,
            created_utc: 0,
            link_karma: 0,
            comment_karma: 0,
            icon_img: '',
            has_verified_email: false,
          },
          loading: false,
          error: null,
        },
      });

      expect(screen.queryByTestId('sub-favorite')).not.toBeInTheDocument();
    });

    it('does not show favorite button when user_has_favorited is undefined', () => {
      const item = createTestSubreddit({ user_has_favorited: undefined });
      renderNavigationItem(item, false);

      expect(screen.queryByTestId('sub-favorite')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies trigger class when trigger prop is true', () => {
      const item = createTestSubreddit();
      const lastUpdated = Math.floor(Date.now() / 1000) - 3600;

      renderNavigationItem(item, true, {
        lastUpdated: {
          t5_test: { lastPost: lastUpdated },
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('class', 'sub-today mark trigger');
    });

    it('passes correct props to NavigationGenericNavItem', () => {
      const item = createTestSubreddit({
        id: 't5_unique',
        display_name: 'uniquesub',
        title: 'Unique Sub',
      });
      renderNavigationItem(item, false);

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('data-id', 't5_unique');
      expect(navItem).toHaveAttribute('data-no-li', 'true');
      expect(navItem).toHaveTextContent('uniquesub');
    });
  });

  describe('Edge Cases', () => {
    it('handles subreddit with no name property', () => {
      const item = createTestSubreddit({ name: undefined as any });
      renderNavigationItem(item, false, {
        lastUpdated: {
          t5_test: { lastPost: 123456 },
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('title', 'Test Subreddit');
    });

    it('handles empty sort correctly', () => {
      const item = createTestSubreddit({ url: '/r/test' });
      renderNavigationItem(item, false, {
        listingsFilter: {
          sort: '',
          target: '',
          multi: false,
          userType: '',
          user: '',
          listType: 'r',
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/test');
    });

    it('ignores irrelevant sort types', () => {
      const item = createTestSubreddit({ url: '/r/test' });
      renderNavigationItem(item, false, {
        listingsFilter: {
          sort: 'relevance',
          target: '',
          multi: false,
          userType: '',
          user: '',
          listType: 'r',
        },
      });

      const navItem = screen.getByTestId('nav-item');
      expect(navItem).toHaveAttribute('href', '/r/test');
    });
  });

  describe('Component Structure', () => {
    it('renders within li element with correct classes', () => {
      const item = createTestSubreddit();
      const { container } = renderNavigationItem(item, false);

      const li = container.querySelector('li');
      expect(li).toHaveClass('nav-item', 'd-flex', 'align-items-center');
    });

    it('wraps content in flex container', () => {
      const item = createTestSubreddit();
      const { container } = renderNavigationItem(item, false);

      const flexDiv = container.querySelector('.d-flex.w-100');
      expect(flexDiv).toBeInTheDocument();
    });
  });
});

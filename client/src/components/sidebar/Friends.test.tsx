import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import Friends from './Friends';

// Mock dependencies
vi.mock('@/redux/actions/subreddits', () => ({
  subredditsData: vi.fn((data) => ({
    type: 'SUBREDDITS_DATA',
    subreddits: data,
  })),
}));

vi.mock('@/common', () => ({
  setMenuStatus: vi.fn(),
  getMenuStatus: vi.fn(),
}));

vi.mock('@/reddit/redditAPI', () => ({
  default: {
    followUser: vi.fn(),
  },
}));

vi.mock('./navHelpers', () => ({
  getDiffClassName: vi.fn((lastUpdated) => {
    if (lastUpdated === 0) {
      return '';
    }
    const now = Math.floor(Date.now() / 1000);
    const diff = now - lastUpdated;
    if (diff < 1800) {
      return 'sub-new';
    }
    if (diff < 86400) {
      return 'sub-today';
    }
    return '';
  }),
}));

// Mock NavigationGenericNavItem to avoid dependencies
vi.mock('./NavigationGenericNavItem', () => ({
  default: ({ text, title, to, badge, classes, id, iconClass, noLi }: any) => {
    if (noLi) {
      return (
        <a
          className={classes}
          data-testid={`nav-item-${id || text}`}
          href={to}
          title={title}
        >
          {iconClass && <i className={iconClass} />} {text}{' '}
          {badge && <span className="badge">{badge}</span>}
        </a>
      );
    }
    return (
      <li className="nav-item">
        <a
          className={classes}
          data-testid={`nav-item-${id || text}`}
          href={to}
          title={title}
        >
          {iconClass && <i className={iconClass} />} {text}{' '}
          {badge && <span className="badge">{badge}</span>}
        </a>
      </li>
    );
  },
}));

describe('Friends', () => {
  const createTestStore = (initialState?: Partial<RootState>) => {
    const defaultState: Partial<RootState> = {
      subreddits: {
        status: 'loaded',
        subreddits: {
          u_testuser1: {
            id: 'abc123',
            display_name: 'u_testuser1',
            url: '/user/testuser1/',
            subreddit_type: 'user',
            name: 'u_testuser1',
            title: 'Test User 1',
            created_utc: 1234567890,
          },
          u_testuser2: {
            id: 'def456',
            display_name: 'u_testuser2',
            url: '/user/testuser2/',
            subreddit_type: 'user',
            name: 'u_testuser2',
            title: 'Test User 2',
            created_utc: 1234567890,
          },
          programming: {
            id: 'ghi789',
            display_name: 'programming',
            url: '/r/programming/',
            subreddit_type: 'public',
            name: 'programming',
            title: 'Programming',
            created_utc: 1234567890,
          },
        },
        lastUpdated: Date.now(),
      },
      lastUpdated: {
        t5_abc123: { lastPost: Math.floor(Date.now() / 1000) - 900 }, // 15 minutes ago
        t5_def456: { lastPost: 0 },
      },
      ...initialState,
    };

    return configureStore({
      reducer: {
        subreddits: (state = defaultState.subreddits) => state,
        lastUpdated: (state = defaultState.lastUpdated) => state,
      } as any,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn();
  });

  it('renders friends link when friends exist', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByTitle("Show Friend's Posts")).toBeInTheDocument();
  });

  it('returns null when no friends exist', () => {
    const store = createTestStore({
      subreddits: {
        status: 'loaded',
        subreddits: {
          programming: {
            id: 'ghi789',
            display_name: 'programming',
            url: '/r/programming/',
            subreddit_type: 'public',
            name: 'programming',
            title: 'Programming',
            created_utc: 1234567890,
          },
        },
        lastUpdated: Date.now(),
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when subreddits are not loaded', () => {
    const store = createTestStore({
      subreddits: {
        status: 'loading',
        subreddits: {},
        lastUpdated: 0,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('toggles friends list visibility when clicking expand/collapse button', async () => {
    const { getMenuStatus, setMenuStatus } = await import('@/common');
    vi.mocked(getMenuStatus).mockReturnValue(false);

    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    const toggleButton = screen.getByLabelText('Show Friends');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.queryByText('testuser1')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(setMenuStatus).toHaveBeenCalledWith('friends', true);
  });

  it('displays friend items with correct information', async () => {
    const { getMenuStatus } = await import('@/common');
    vi.mocked(getMenuStatus).mockReturnValue(true);

    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('nav-item-abc123')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-def456')).toBeInTheDocument();
    expect(screen.getByText('testuser1')).toBeInTheDocument();
    expect(screen.getByText('testuser2')).toBeInTheDocument();

    // Check for New badge on recently updated friend
    const newBadge = screen
      .getByTestId('nav-item-abc123')
      .querySelector('.badge');
    expect(newBadge).toBeInTheDocument();
    expect(newBadge).toHaveTextContent('New');
  });

  it('unfollows a user when clicking remove button and confirming', async () => {
    const { subredditsData } = await import('@/redux/actions/subreddits');
    const { getMenuStatus } = await import('@/common');
    const RedditAPI = (await import('@/reddit/redditAPI')).default;

    vi.mocked(getMenuStatus).mockReturnValue(true);
    window.confirm = vi.fn().mockReturnValue(true);

    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    const removeButtons = screen.getAllByLabelText(
      /Remove .* from friend's list/
    );
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Remove testuser1 from friends?'
    );

    await waitFor(() => {
      expect(RedditAPI.followUser).toHaveBeenCalledWith('u_testuser1', 'unsub');
    });

    await waitFor(() => {
      expect(subredditsData).toHaveBeenCalled();
    });

    // Verify the updated subreddits data no longer contains the unfollowed user
    const updatedSubreddits = (subredditsData as any).mock.calls[0][0];
    expect(updatedSubreddits.subreddits).not.toHaveProperty('u_testuser1');
    expect(updatedSubreddits.subreddits).toHaveProperty('u_testuser2');
  });

  it('does not unfollow a user when canceling confirmation', async () => {
    const { getMenuStatus } = await import('@/common');
    const RedditAPI = (await import('@/reddit/redditAPI')).default;

    vi.mocked(getMenuStatus).mockReturnValue(true);
    window.confirm = vi.fn().mockReturnValue(false);

    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    const removeButtons = screen.getAllByLabelText(
      /Remove .* from friend's list/
    );
    fireEvent.click(removeButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(RedditAPI.followUser).not.toHaveBeenCalled();
  });

  it('handles error when unfollowing user fails', async () => {
    const { getMenuStatus } = await import('@/common');
    const RedditAPI = (await import('@/reddit/redditAPI')).default;

    vi.mocked(getMenuStatus).mockReturnValue(true);
    window.confirm = vi.fn().mockReturnValue(true);
    vi.mocked(RedditAPI.followUser).mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Friends />
        </MemoryRouter>
      </Provider>
    );

    const removeButtons = screen.getAllByLabelText(
      /Remove .* from friend's list/
    );
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error unfollowing user u_testuser1:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});

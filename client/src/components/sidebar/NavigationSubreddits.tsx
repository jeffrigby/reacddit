import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faSyncAlt,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import type { SubredditData } from '@/types/redditApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useGetSubredditsQuery, subredditSelectors } from '@/redux/api';
import { selectSubredditFilter } from '@/redux/slices/subredditFilterSlice';
import {
  fetchSubredditsLastUpdated,
  lastUpdatedCleared,
  selectEarliestExpiration,
} from '@/redux/slices/subredditPollingSlice';
import { getMenuStatus, hotkeyStatus, setMenuStatus, isEmpty } from '@/common';
import NavigationItem from './NavigationItem';
import SyncStatus from './SyncStatus';

function NavigationSubReddits() {
  const [showMenu, setShowMenu] = useState(getMenuStatus('subreddits', true));
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const filter = useAppSelector(selectSubredditFilter);
  const dispatch = useAppDispatch();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
  const earliestExpiration = useAppSelector(selectEarliestExpiration);
  const earliestExpirationRef = useRef(earliestExpiration);
  const prevWhereRef = useRef<string | null>(null);
  const lastRefreshTimeRef = useRef(Date.now());

  // Use RTK Query hook - automatically fetches and caches
  const { data, isLoading, isError, refetch } = useGetSubredditsQuery(
    { where },
    {
      // Don't refetch on mount if we have cached data (1-hour cache)
      refetchOnMountOrArgChange: false,
    }
  );

  // Get all subreddits as array from the entity state
  const allSubreddits = useMemo(
    () => (data ? subredditSelectors.selectAll(data) : []),
    [data]
  );

  // Filter subreddits locally
  const filteredSubreddits = useMemo(() => {
    if (!filter.filterText) {
      return allSubreddits;
    }

    const filterLower = filter.filterText.toLowerCase();
    return allSubreddits.filter((sub: SubredditData) =>
      sub.display_name.toLowerCase().includes(filterLower)
    );
  }, [allSubreddits, filter.filterText]);

  // Clear polling state when auth status changes
  useEffect(() => {
    if (prevWhereRef.current !== null && prevWhereRef.current !== where) {
      // RTK Query automatically handles separate caches for different 'where' values
      // Just clear polling state
      dispatch(lastUpdatedCleared());
    }
    prevWhereRef.current = where;
  }, [where, dispatch]);

  // Keep ref in sync so the polling effect can read the latest value
  // without re-running (avoids tearing down event listeners on each batch flush)
  useEffect(() => {
    earliestExpirationRef.current = earliestExpiration;
  }, [earliestExpiration]);

  // Visibility-aware smart polling for last updated timestamps.
  // Instead of a blind 60-second interval, dynamically schedules the next
  // check based on the earliest cache expiration time. Pauses when the tab
  // is hidden or offline, and resumes immediately when the user returns.
  //
  // Uses earliestExpirationRef (not earliestExpiration directly) so the
  // effect doesn't tear down/re-register listeners on each batch dispatch.
  useEffect(() => {
    const MIN_INTERVAL_MS = 60_000; // 60 seconds minimum
    const MAX_INTERVAL_MS = 3_600_000; // 1 hour maximum

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const dispatchIfOnline = (): void => {
      if (navigator.onLine) {
        dispatch(fetchSubredditsLastUpdated());
      }
    };

    const computeDelay = (): number => {
      const exp = earliestExpirationRef.current;
      if (exp === null) {
        return MIN_INTERVAL_MS;
      }
      const msUntilExpiry = (exp - Date.now() / 1000) * 1000;
      return Math.min(
        Math.max(msUntilExpiry, MIN_INTERVAL_MS),
        MAX_INTERVAL_MS
      );
    };

    const scheduleNextPoll = (): void => {
      if (document.hidden) {
        return;
      }

      timeoutId = setTimeout(() => {
        dispatchIfOnline();
        scheduleNextPoll();
      }, computeDelay());
    };

    const cancelPoll = (): void => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        cancelPoll();
      } else {
        // Tab became visible — poll immediately if online, then schedule next
        dispatchIfOnline();
        cancelPoll();
        scheduleNextPoll();
      }
    };

    const handleOnline = (): void => {
      if (!document.hidden) {
        dispatchIfOnline();
        cancelPoll();
        scheduleNextPoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Start scheduling (only if tab is visible)
    if (!document.hidden) {
      scheduleNextPoll();
    }

    return () => {
      cancelPoll();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch, where]);

  // Automatically refresh subreddit list every 15 minutes (visibility-aware).
  // Refetches immediately on tab return if enough time has elapsed.
  // Uses lastRefreshTimeRef so the timestamp survives effect re-runs.
  useEffect(() => {
    const REFRESH_INTERVAL_MS = 900_000; // 15 minutes
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startRefreshInterval = (): void => {
      intervalId = setInterval(() => {
        refetch();
        lastRefreshTimeRef.current = Date.now();
      }, REFRESH_INTERVAL_MS);
    };

    const stopRefreshInterval = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = (): void => {
      if (document.hidden) {
        stopRefreshInterval();
      } else {
        // Refetch immediately if enough time passed while hidden
        if (Date.now() - lastRefreshTimeRef.current >= REFRESH_INTERVAL_MS) {
          refetch();
          lastRefreshTimeRef.current = Date.now();
        }
        startRefreshInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    if (!document.hidden) {
      startRefreshInterval();
    }

    return () => {
      stopRefreshInterval();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refetch]);

  const reloadSubreddits = useCallback(async () => {
    // Refetch subreddits list without clearing lastUpdated cache
    await refetch();
  }, [refetch]);

  useEffect(() => {
    const handleSubredditHotkey = (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case '®':
            reloadSubreddits();
            break;
          default:
            break;
        }
      }
    };
    document.addEventListener('keydown', handleSubredditHotkey);
    return () => {
      document.removeEventListener('keydown', handleSubredditHotkey);
    };
  }, [reloadSubreddits]);

  const reloadSubredditsClick = (event: React.MouseEvent) => {
    event.preventDefault();
    reloadSubreddits();
  };

  const toggleMenu = () => {
    setMenuStatus('subreddits', !showMenu);
    setShowMenu(!showMenu);
  };

  const navItems = useMemo(() => {
    const filterActive = filter.active && !isEmpty(filter.filterText);

    // Separate favorites and regular subreddits
    const { favorites, regular } = filteredSubreddits.reduce<{
      favorites: SubredditData[];
      regular: SubredditData[];
    }>(
      (
        acc: { favorites: SubredditData[]; regular: SubredditData[] },
        item: SubredditData
      ) => {
        if (item.subreddit_type === 'user') {
          return acc;
        }
        if (item.user_has_favorited) {
          acc.favorites.push(item);
        } else {
          acc.regular.push(item);
        }
        return acc;
      },
      { favorites: [], regular: [] }
    );

    const items: React.ReactElement[] = [];
    let pos = 0;

    // Render favorites
    if (favorites.length > 0) {
      favorites.forEach((sub: SubredditData) => {
        const trigger = filter.activeIndex === pos && filterActive;
        items.push(
          <NavigationItem item={sub} key={sub.name} trigger={trigger} />
        );
        pos += 1;
      });
      items.push(
        <li key="divider">
          <hr />
        </li>
      );
    }

    // Render regular subreddits
    regular.forEach((sub: SubredditData) => {
      const trigger = filter.activeIndex === pos && filterActive;
      items.push(
        <NavigationItem item={sub} key={sub.name} trigger={trigger} />
      );
      pos += 1;
    });

    return items;
  }, [
    filteredSubreddits,
    filter.active,
    filter.activeIndex,
    filter.filterText,
  ]);

  const caretIcon = showMenu ? faCaretDown : faCaretRight;

  let content: React.ReactElement | undefined;
  if (isLoading) {
    // No loading UI
  } else if (isError) {
    content = (
      <div
        className="alert alert-danger small"
        id="subreddits-load-error"
        role="alert"
      >
        <FontAwesomeIcon icon={faExclamationTriangle} /> Error loading
        subreddits
        <br />
        <button
          aria-label="Reload Subreddits"
          className="astext"
          type="button"
          onClick={reloadSubredditsClick}
        >
          try again.
        </button>
      </div>
    );
  } else {
    const noItems = isEmpty(navItems);
    if (noItems) {
      content = (
        <div className="alert alert-info" id="subreddits-end" role="alert">
          <FontAwesomeIcon icon={faInfoCircle} /> No subreddits found
        </div>
      );
    } else {
      content = <ul className="nav flex-column">{navItems}</ul>;
    }
  }

  const handleReloadKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      reloadSubreddits();
    }
  };

  return (
    <div id="sidebar-subreddits">
      <div className="sidebar-heading d-flex text-muted">
        <span
          className="me-auto show-cursor"
          role="presentation"
          onClick={toggleMenu}
        >
          <FontAwesomeIcon className="menu-caret" icon={caretIcon} /> Subreddits
        </span>
        <span>
          <FontAwesomeIcon
            aria-label="Reload Subreddits"
            className="reload"
            icon={faSyncAlt}
            role="button"
            spin={isLoading}
            tabIndex={-1}
            onClick={reloadSubredditsClick}
            onKeyDown={handleReloadKeyDown}
          />
        </span>
      </div>
      {(showMenu || filter.filterText) && content}
      {(showMenu || filter.filterText) && <SyncStatus />}
    </div>
  );
}

export default NavigationSubReddits;

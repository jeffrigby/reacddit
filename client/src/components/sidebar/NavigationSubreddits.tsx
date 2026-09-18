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
import {
  fetchSubredditsLastUpdated,
  lastUpdatedCleared,
  selectEarliestExpiration,
} from '@/redux/slices/subredditPollingSlice';
import { getMenuStatus, hotkeyStatus, setMenuStatus, isEmpty } from '@/common';
import { buildSubredditHref } from './navHelpers';
import NavigationItem from './NavigationItem';
import SyncStatus from './SyncStatus';
import { useFilteredSubreddits } from './useFilteredSubreddits';
import { useNavSection } from './useNavSection';
import { useSidebarSelection } from './useSidebarSelection';
import { useSubredditSortPath } from './useSubredditSortPath';

// Interval of the shared clock the staleness classes are measured against.
// One reading serves the whole list, so it is coarse enough that invalidating
// every row's memo stays cheap.
const STALENESS_TICK_MS = 300_000; // 5 minutes

function NavigationSubReddits() {
  const [showMenu, setShowMenu] = useState(() =>
    getMenuStatus('subreddits', true)
  );
  const [now, setNow] = useState(() => Date.now());
  const dispatch = useAppDispatch();
  const sortPath = useSubredditSortPath();

  const earliestExpiration = useAppSelector(selectEarliestExpiration);
  const earliestExpirationRef = useRef(earliestExpiration);
  const prevWhereRef = useRef<string | null>(null);
  // eslint-disable-next-line @eslint-react/purity -- ref initializer runs once at mount
  const lastRefreshTimeRef = useRef(Date.now());
  const initialPollFiredRef = useRef(false);

  const { favorites, regular, where, data, isLoading, isError, refetch } =
    useFilteredSubreddits();
  const { filterActive, filterText, selectedTarget } = useSidebarSelection();

  // Clear polling state when auth status changes
  useEffect(() => {
    if (prevWhereRef.current !== null && prevWhereRef.current !== where) {
      // RTK Query automatically handles separate caches for different 'where' values
      // Just clear polling state
      dispatch(lastUpdatedCleared());
      initialPollFiredRef.current = false;
    }
    prevWhereRef.current = where;
  }, [where, dispatch]);

  // Keep ref in sync so the polling effect can read the latest value
  // without re-running (avoids tearing down event listeners on each batch flush)
  useEffect(() => {
    earliestExpirationRef.current = earliestExpiration;
  }, [earliestExpiration]);

  // Fire the initial poll once subreddit data becomes available.
  // Uses a ref so this only fires once (reset on auth change).
  useEffect(() => {
    if (data && !initialPollFiredRef.current && !document.hidden) {
      initialPollFiredRef.current = true;
      dispatch(fetchSubredditsLastUpdated());
    }
  }, [data, dispatch]);

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

  // Shared clock for the staleness classes, which are derived from elapsed time
  // rather than from any store value. One interval drives every row; it runs
  // only while the tab is visible and takes a fresh reading on return.
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTick = (): void => {
      intervalId = setInterval(() => {
        setNow(Date.now());
      }, STALENESS_TICK_MS);
    };

    const stopTick = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = (): void => {
      stopTick();
      if (!document.hidden) {
        setNow(Date.now());
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    if (!document.hidden) {
      startTick();
    }

    return () => {
      stopTick();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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

  const menuOpen = showMenu || !isEmpty(filterText);

  // Hrefs are built once and used for both the anchors and the registry, so
  // the path keyboard navigation lands on is the path the link carries.
  const rows = useMemo(
    () =>
      [...favorites, ...regular].map((sub) => ({
        sub,
        href: buildSubredditHref(
          sub.url,
          sortPath,
          sub.subreddit_type === 'user'
        ),
      })),
    [favorites, regular, sortPath]
  );

  // The list renders nothing while loading, after an error, or when collapsed.
  const targets = useMemo(
    () =>
      !isLoading && !isError && menuOpen ? rows.map((row) => row.href) : [],
    [rows, isLoading, isError, menuOpen]
  );

  useNavSection('subscribed', targets);

  const navItems = useMemo(() => {
    const items: React.ReactElement[] = [];

    function renderItem(sub: SubredditData, href: string): React.ReactElement {
      return (
        <NavigationItem
          href={href}
          item={sub}
          key={sub.name}
          now={now}
          trigger={filterActive && href === selectedTarget}
        />
      );
    }

    const favoriteCount = favorites.length;
    rows.forEach(({ sub, href }, idx) => {
      items.push(renderItem(sub, href));
      if (favoriteCount > 0 && idx === favoriteCount - 1) {
        items.push(
          <li key="divider">
            <hr />
          </li>
        );
      }
    });

    return items;
  }, [rows, favorites.length, filterActive, selectedTarget, now]);

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
          className="text-button text-decoration-underline"
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

  return (
    <div id="sidebar-subreddits">
      <div className="sidebar-heading d-flex text-muted">
        <button
          aria-expanded={showMenu}
          className="text-button me-auto show-cursor"
          type="button"
          onClick={toggleMenu}
        >
          <FontAwesomeIcon className="menu-caret" icon={caretIcon} /> Subreddits
        </button>
        <button
          aria-label="Reload Subreddits"
          className="text-button reload"
          type="button"
          onClick={reloadSubredditsClick}
        >
          <FontAwesomeIcon icon={faSyncAlt} spin={isLoading} />
        </button>
      </div>
      {menuOpen && content}
      {menuOpen && <SyncStatus />}
    </div>
  );
}

export default NavigationSubReddits;

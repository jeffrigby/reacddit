import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
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
} from '@/redux/slices/subredditPollingSlice';
import { getMenuStatus, hotkeyStatus, setMenuStatus } from '@/common';
import NavigationItem from './NavigationItem';
import SyncStatus from './SyncStatus';

function NavigationSubReddits() {
  const [showMenu, setShowMenu] = useState(getMenuStatus('subreddits', true));
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const filter = useAppSelector(selectSubredditFilter);
  const dispatch = useAppDispatch();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
  const prevWhereRef = useRef<string | null>(null);

  // Use RTK Query hook - automatically fetches and caches
  const { allSubreddits, isLoading, isError, refetch } = useGetSubredditsQuery(
    { where },
    {
      // Use selectFromResult to extract and filter data
      selectFromResult: ({ data, isLoading, isError, refetch }) => ({
        // Get all subreddits as array
        allSubreddits: data ? subredditSelectors.selectAll(data) : [],
        isLoading,
        isError,
        refetch, // Must explicitly include refetch when using selectFromResult
      }),
      // Don't refetch on mount if we have cached data (1-hour cache)
      refetchOnMountOrArgChange: false,
    }
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

  useEffect(() => {
    const checkLastUpdated = setInterval(() => {
      dispatch(fetchSubredditsLastUpdated());
    }, 60000);
    return () => {
      clearInterval(checkLastUpdated);
    };
  }, [dispatch, where]);

  // Automatically refresh subreddit list every 15 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refetch();
    }, 900000); // 15 minutes
    return () => {
      clearInterval(refreshInterval);
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

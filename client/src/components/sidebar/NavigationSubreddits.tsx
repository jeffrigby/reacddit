import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import type { SubredditData } from '@/types/redditApi';
import type { RootState, AppDispatch } from '@/types/redux';
import { filterSubs } from '@/redux/selectors/subredditSelectors';
import {
  subredditsFetchData,
  subredditsFetchLastUpdated,
} from '@/redux/actions/subreddits';
import { getMenuStatus, hotkeyStatus, setMenuStatus } from '@/common';
import NavigationItem from './NavigationItem';

function NavigationSubReddits() {
  const [showMenu, setShowMenu] = useState(getMenuStatus('subreddits', true));
  const redditBearer = useSelector((state: RootState) => state.redditBearer);
  const subreddits = useSelector((state: RootState) => state.subreddits);
  const filter = useSelector((state: RootState) => state.subredditsFilter);
  const filteredSubreddits = useSelector((state: RootState) =>
    filterSubs(state)
  );
  const dispatch = useDispatch<AppDispatch>();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  useEffect(() => {
    dispatch(subredditsFetchData(false, where));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 'where' is derived from redditBearer.status
  }, [redditBearer.status, dispatch]);

  useEffect(() => {
    const checkLastUpdated = setInterval(() => {
      dispatch(subredditsFetchLastUpdated());
    }, 60000);
    return () => {
      clearInterval(checkLastUpdated);
    };
  }, [dispatch, where]);

  const reloadSubreddits = useCallback(() => {
    dispatch(subredditsFetchData(true, where));
  }, [dispatch, where]);

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
    const { favorites, regular } = Object.values(filteredSubreddits).reduce<{
      favorites: SubredditData[];
      regular: SubredditData[];
    }>(
      (acc, item) => {
        if (item.subreddit_type === 'user') {
          return acc;
        }
        if (item.user_has_favorited) {
          acc.favorites.push(item as SubredditData);
        } else {
          acc.regular.push(item as SubredditData);
        }
        return acc;
      },
      { favorites: [], regular: [] }
    );

    const items: React.ReactElement[] = [];
    let pos = 0;

    // Render favorites
    if (favorites.length > 0) {
      favorites.forEach((sub) => {
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
    regular.forEach((sub) => {
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

  const caretClass = showMenu
    ? 'fas fa-caret-down menu-caret'
    : 'fas fa-caret-right menu-caret';

  let content: React.ReactElement | undefined;
  if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
    // content = (
    //   <div className="alert alert-info" id="subreddits-loading" role="alert">
    //     <i className="fas fa-spinner fa-spin" /> Loading Subreddits
    //   </div>
    // );
  } else if (subreddits.status === 'error') {
    content = (
      <div
        className="alert alert-danger small"
        id="subreddits-load-error"
        role="alert"
      >
        <i className="fas fa-exclamation-triangle" /> Error loading subreddits
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
  } else if (subreddits.status === 'loaded') {
    const noItems = isEmpty(navItems);
    if (noItems) {
      content = (
        <div className="alert alert-info" id="subreddits-end" role="alert">
          <i className="fas fa-info-circle" /> No subreddits found
        </div>
      );
    } else {
      content = <ul className="nav flex-column">{navItems}</ul>;
    }
  }

  let spinnerClass = 'fas fa-sync-alt reload';
  if (subreddits.status === 'loading') {
    spinnerClass += ' fa-spin';
  }

  const handleReloadKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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
          <i className={caretClass} /> Subreddits
        </span>
        <span>
          <i
            aria-label="Reload Subreddits"
            className={spinnerClass}
            role="button"
            tabIndex={-1}
            onClick={reloadSubredditsClick}
            onKeyDown={handleReloadKeyDown}
          />
        </span>
      </div>
      {(showMenu || filter.filterText) && content}
    </div>
  );
}

export default NavigationSubReddits;

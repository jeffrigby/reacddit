import { useCallback, useEffect, useState } from 'react';
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
  }, [redditBearer.status, dispatch, where]);

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

  const generateNavItems = () => {
    const favoritesArray: SubredditData[] = [];
    const itemsArray: SubredditData[] = [];

    Object.values(filteredSubreddits).forEach((item) => {
      if (item.user_has_favorited) {
        favoritesArray.push(item as SubredditData);
      } else {
        itemsArray.push(item as SubredditData);
      }
    });

    let pos = 0;
    const navItems: React.ReactElement[] = [];
    const filterActive = filter.active && !isEmpty(filter.filterText);
    if (favoritesArray.length) {
      favoritesArray.forEach((sub) => {
        const trigger = filter.activeIndex === pos && filterActive;
        navItems.push(
          <NavigationItem item={sub} key={sub.name} trigger={trigger} />
        );
        pos += 1;
      });
      navItems.push(
        <li key="divider">
          <hr />
        </li>
      );
    }

    itemsArray.forEach((sub) => {
      const trigger = filter.activeIndex === pos && filterActive;
      const { subreddit_type: subredditType } = sub;
      if (subredditType === 'user') {
        return;
      }
      navItems.push(
        <NavigationItem item={sub} key={sub.name} trigger={trigger} />
      );
      pos += 1;
    });

    return navItems;
  };

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
    const navItems = generateNavItems();
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
      reloadSubredditsClick(event as unknown as React.MouseEvent);
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

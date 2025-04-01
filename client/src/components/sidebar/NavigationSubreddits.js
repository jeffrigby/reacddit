import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import NavigationItem from './NavigationItem';
import { filterSubs } from '../../redux/selectors/subredditSelectors';
import {
  subredditsFetchData,
  subredditsFetchLastUpdated,
} from '../../redux/actions/subreddits';
import { getMenuStatus, hotkeyStatus, setMenuStatus } from '../../common';

const NavigationSubReddits = () => {
  const [showMenu, setShowMenu] = useState(getMenuStatus('subreddits', true));
  const redditBearer = useSelector((state) => state.redditBearer);
  const subreddits = useSelector((state) => state.subreddits);
  const filter = useSelector((state) => state.subredditsFilter);
  const filteredSubreddits = useSelector((state) => filterSubs(state));
  const dispatch = useDispatch();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  // Fetch initial data.
  useEffect(() => {
    dispatch(subredditsFetchData(false, where));
  }, [redditBearer.status, dispatch, where]);

  // Check for new data every 60 seconds.
  useEffect(() => {
    const checkLastUpdated = setInterval(() => {
      dispatch(subredditsFetchLastUpdated());
    }, 60000);
    return () => {
      clearInterval(checkLastUpdated);
    };
  }, [dispatch, where]);

  /**
   * Force reload all the subreddits.
   */
  const reloadSubreddits = useCallback(() => {
    dispatch(subredditsFetchData(true, where));
  }, [dispatch, where]);

  useEffect(() => {
    /**
     * Configure the navigation hotkeys.
     * @param event
     */
    const handleSubredditHotkey = (event) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case '®': // alt-r (option)
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

  /**
   * Handle the click on the reload subreddits
   * @param e
   */
  const reloadSubredditsClick = (e) => {
    e.preventDefault();
    reloadSubreddits();
  };

  const toggleMenu = () => {
    setMenuStatus('subreddits', !showMenu);
    setShowMenu(!showMenu);
  };

  /**
   * Generate the subreddit nav items.
   * @returns {Array}
   */
  const generateNavItems = () => {
    const favoritesArray = [];
    const itemsArray = [];

    Object.values(filteredSubreddits).forEach((item) => {
      if (item.user_has_favorited) {
        favoritesArray.push(item);
      } else {
        itemsArray.push(item);
      }
    });

    let pos = 0;
    const navItems = [];
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

  let content;
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
            tabIndex="-1"
            onClick={reloadSubredditsClick}
            onKeyDown={reloadSubredditsClick}
          />
        </span>
      </div>
      {(showMenu || filter.filterText) && content}
    </div>
  );
};

export default NavigationSubReddits;

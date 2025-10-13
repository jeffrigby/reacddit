import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
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
import type { AppDispatch } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import {
  fetchSubreddits,
  fetchSubredditsLastUpdated,
  selectSubredditsStatus,
  selectSubredditsFilter,
  selectFilteredSubreddits,
} from '@/redux/slices/subredditsSlice';
import { getMenuStatus, hotkeyStatus, setMenuStatus } from '@/common';
import NavigationItem from './NavigationItem';

function NavigationSubReddits() {
  const [showMenu, setShowMenu] = useState(getMenuStatus('subreddits', true));
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const subredditsStatus = useAppSelector(selectSubredditsStatus);
  const filter = useAppSelector(selectSubredditsFilter);
  const filteredSubreddits = useAppSelector(selectFilteredSubreddits);
  const dispatch = useDispatch<AppDispatch>();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  useEffect(() => {
    dispatch(fetchSubreddits({ reset: false, where }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 'where' is derived from redditBearer.status
  }, [redditBearer.status, dispatch]);

  useEffect(() => {
    const checkLastUpdated = setInterval(() => {
      dispatch(fetchSubredditsLastUpdated());
    }, 60000);
    return () => {
      clearInterval(checkLastUpdated);
    };
  }, [dispatch, where]);

  const reloadSubreddits = useCallback(() => {
    dispatch(fetchSubreddits({ reset: true, where }));
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
    const { favorites, regular } = filteredSubreddits.reduce<{
      favorites: SubredditData[];
      regular: SubredditData[];
    }>(
      (acc, item) => {
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

  const caretIcon = showMenu ? faCaretDown : faCaretRight;

  let content: React.ReactElement | undefined;
  if (subredditsStatus === 'loading' || subredditsStatus === 'idle') {
    // content = (
    //   <div className="alert alert-info" id="subreddits-loading" role="alert">
    //     <FontAwesomeIcon icon={faSpinner} spin /> Loading Subreddits
    //   </div>
    // );
  } else if (subredditsStatus === 'failed') {
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
  } else if (subredditsStatus === 'succeeded') {
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

  const isReloading = subredditsStatus === 'loading';

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
            spin={isReloading}
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

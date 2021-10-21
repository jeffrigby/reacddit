import { useEffect, useRef, useCallback } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from 'react-device-detect';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { hotkeyStatus } from '../../common';

function NavigationPrimaryLinks() {
  const me = useSelector((state) => state.redditMe.me);
  const redditBearer = useSelector((state) => state.redditBearer);
  const sort = useSelector((state) => state.listingsFilter.sort);
  const t = useSelector((state) => state.listingsFilter.t);
  const subreddits = useSelector((state) => state.subreddits);
  const dispatch = useDispatch();

  const gotoLink = useCallback(
    (url) => {
      dispatch(push(url));
    },
    [dispatch]
  );

  const lastKeyPressed = useRef('');

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @returns {*}
   */
  const randomSubPush = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (isEmpty(subreddits.subreddits)) {
        return false;
      }

      const keys = Object.keys(subreddits.subreddits);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomSubreddit = subreddits.subreddits[randomKey];

      const sortTopQS =
        sort === 'top' || sort === 'controversial' ? `?t=${t}` : '';

      const url = randomSubreddit.url + (sort || 'hot') + sortTopQS;
      return gotoLink(url);
    },
    [gotoLink, sort, subreddits.subreddits, t]
  );

  const getLoginUrl = useCallback(() => {
    const { loginURL } = redditBearer;

    if (!loginURL) {
      return `${process.env.API_PATH}/login`;
    }

    if (isMobile) {
      return loginURL.replace('/authorize', '/authorize.compact');
    }

    return loginURL;
  }, [redditBearer]);

  const openHotkeys = (e) => {
    if (e) e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('hotkeys'));
    modal.show();
  };

  useEffect(() => {
    const handleNavPrimaryHotkey = (event) => {
      const { key } = event;

      if (hotkeyStatus()) {
        // Navigation key commands
        if (lastKeyPressed.current === 'g') {
          switch (key) {
            case 'h':
              gotoLink('/');
              break;
            case 'p':
              gotoLink(`/r/popular`);
              break;
            case 'r':
              randomSubPush();
              break;
            default:
              break;
          }
        }

        if (key === 'L') {
          window.location.href = me.name
            ? `${process.env.API_PATH}/logout`
            : getLoginUrl();
        }

        lastKeyPressed.current = key;
      }
    };

    document.addEventListener('keydown', handleNavPrimaryHotkey);
    return () => {
      document.removeEventListener('keydown', handleNavPrimaryHotkey);
    };
  }, [getLoginUrl, gotoLink, me.name, randomSubPush]);

  const currentSort = sort && sort !== 'relevance' ? sort : '';
  const loginLink = getLoginUrl();

  return (
    <ul className="nav flex-column">
      {!me.name && (
        <NavigationGenericNavItem
          to={loginLink}
          text="Reddit Login"
          title="Login to reddit to see your subreddits. ⇧L"
          isStatic
          iconClass="fas fa-sign-in-alt"
        />
      )}
      <NavigationGenericNavItem
        to={`/${currentSort}`}
        text="Front"
        title="Show My Subreddit Posts"
        iconClass="fas fa-home"
      />
      <NavigationGenericNavItem
        to={`/r/popular/${currentSort}`}
        text="Popular"
        title="Popular Posts"
        iconClass="fas fa-fire"
      />
      <NavigationGenericNavItem
        to="/r/random"
        text="Random"
        title="Random Subreddit"
        iconClass="fas fa-random"
        onClickAction={randomSubPush}
        isStatic
      />
      <NavigationGenericNavItem
        to="https://github.com/jeffrigby/reacddit/issues"
        text="Report Bug"
        title="Bugs"
        isStatic
        iconClass="fas fa-bug"
      />
      <NavigationGenericNavItem
        to="/hotkeys"
        text="Hotkeys"
        title="Show Hotkeys"
        iconClass="fas fa-keyboard"
        liClass="no-touch"
        onClickAction={openHotkeys}
        isStatic
      />
    </ul>
  );
}

export default NavigationPrimaryLinks;

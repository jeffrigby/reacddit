import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from 'react-device-detect';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { hotkeyStatus } from '../../common';

const NavigationPrimaryLinks = () => {
  const me = useSelector((state) => state.redditMe.me);
  const redditBearer = useSelector((state) => state.redditBearer);
  const sort = useSelector((state) => state.listingsFilter.sort);
  const query = useSelector((state) => state.listingsFilter.qs);
  const subreddits = useSelector((state) => state.subreddits);
  const navigate = useNavigate();

  const lastKeyPressed = useRef('');

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @returns {*}
   */
  const randomSubPush = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
      }
      if (isEmpty(subreddits.subreddits)) {
        return false;
      }

      const qs = queryString.parse(query);

      const keys = Object.keys(subreddits.subreddits);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomSubreddit = subreddits.subreddits[randomKey];

      const sortTopQS =
        (sort === 'top' || sort === 'controversial') && qs.t
          ? `?t=${qs.t}`
          : '';

      const newSort = sort && sort !== 'relevance' ? sort : 'hot';

      const url = randomSubreddit.url + newSort + sortTopQS;
      return navigate(url);
    },
    [navigate, query, sort, subreddits.subreddits]
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
    if (e) {
      e.preventDefault();
    }
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
              navigate('/');
              break;
            case 'p':
              navigate(`/r/popular`);
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
  }, [getLoginUrl, me.name, navigate, randomSubPush]);

  const currentSort = sort && sort !== 'relevance' ? sort : '';
  const loginLink = getLoginUrl();

  return (
    <ul className="nav flex-column">
      {!me.name && (
        <NavigationGenericNavItem
          isStatic
          iconClass="fas fa-sign-in-alt"
          text="Reddit Login"
          title="Login to reddit to see your subreddits. ⇧L"
          to={loginLink}
        />
      )}
      <NavigationGenericNavItem
        iconClass="fas fa-home"
        text="Front"
        title="Show My Subreddit Posts"
        to={`/${currentSort}`}
      />
      <NavigationGenericNavItem
        iconClass="fas fa-fire"
        text="Popular"
        title="Popular Posts"
        to={`/r/popular/${currentSort}`}
      />
      <NavigationGenericNavItem
        isStatic
        iconClass="fas fa-random"
        text="Random"
        title="Random Subreddit"
        to="/r/random"
        onClickAction={randomSubPush}
      />
      <NavigationGenericNavItem
        isStatic
        iconClass="fas fa-bug"
        text="Report Bug"
        title="Bugs"
        to="https://github.com/jeffrigby/reacddit/issues"
      />
      {!isMobile && (
        <NavigationGenericNavItem
          isStatic
          iconClass="fas fa-keyboard"
          text="Hotkeys"
          title="Show Hotkeys"
          to="/hotkeys"
          onClickAction={openHotkeys}
        />
      )}
    </ul>
  );
};

export default NavigationPrimaryLinks;

import { useEffect, useRef, useCallback } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import queryString from 'query-string';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from 'react-device-detect';
import {
  faHome,
  faFire,
  faRandom,
  faBug,
  faKeyboard,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { useModals } from '@/contexts/ModalContext';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { hotkeyStatus } from '../../common';

function NavigationPrimaryLinks(): ReactElement {
  const me = useAppSelector((state) => state.redditMe?.me);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const sort = useAppSelector((state) => state.listings.currentFilter.sort);
  const query = useAppSelector((state) => state.listings.currentFilter.qs);
  const subreddits = useAppSelector((state) => state.subreddits);
  const navigate = useNavigate();
  const { setShowHotkeys } = useModals();

  const lastKeyPressed = useRef<string>('');

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @param e - Optional mouse event
   * @returns Navigation promise or false
   */
  const randomSubPush = useCallback(
    (
      e?: MouseEvent<HTMLAnchorElement>
    ): ReturnType<typeof navigate> | false => {
      if (e) {
        e.preventDefault();
      }
      if (isEmpty(subreddits.entities)) {
        return false;
      }

      const qs = queryString.parse(query);

      const keys = Object.keys(subreddits.entities);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomSubreddit = subreddits.entities[randomKey];

      const sortTopQS =
        (sort === 'top' || sort === 'controversial') && qs.t
          ? `?t=${qs.t}`
          : '';

      const newSort = sort && sort !== 'relevance' ? sort : 'hot';

      const url = randomSubreddit.url + newSort + sortTopQS;
      return navigate(url);
    },
    [navigate, query, sort, subreddits.entities]
  );

  const getLoginUrl = useCallback((): string => {
    const { loginURL } = redditBearer;

    if (!loginURL) {
      return process.env.API_PATH ? `${process.env.API_PATH}/login` : '/login';
    }

    if (isMobile) {
      return loginURL.replace('/authorize', '/authorize.compact');
    }

    return loginURL;
  }, [redditBearer]);

  function openHotkeys(e?: MouseEvent<HTMLAnchorElement>): void {
    if (e) {
      e.preventDefault();
    }
    setShowHotkeys(true);
  }

  useEffect(() => {
    function handleNavPrimaryHotkey(event: KeyboardEvent): void {
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
          window.location.href = me?.name
            ? `${process.env.API_PATH}/logout`
            : getLoginUrl();
        }

        lastKeyPressed.current = key;
      }
    }

    document.addEventListener('keydown', handleNavPrimaryHotkey);
    return () => {
      document.removeEventListener('keydown', handleNavPrimaryHotkey);
    };
  }, [getLoginUrl, me?.name, navigate, randomSubPush]);

  const currentSort = sort && sort !== 'relevance' ? sort : '';
  const loginLink = getLoginUrl();

  return (
    <ul className="nav flex-column">
      {!me?.name && (
        <NavigationGenericNavItem
          isStatic
          icon={faSignInAlt}
          text="Reddit Login"
          title="Login to reddit to see your subreddits. ⇧L"
          to={loginLink}
        />
      )}
      <NavigationGenericNavItem
        icon={faHome}
        text="Front"
        title="Show My Subreddit Posts"
        to={`/${currentSort}`}
      />
      <NavigationGenericNavItem
        icon={faFire}
        text="Popular"
        title="Popular Posts"
        to={`/r/popular/${currentSort}`}
      />
      <NavigationGenericNavItem
        isStatic
        icon={faRandom}
        text="Random"
        title="Random Subreddit"
        to="/r/random"
        onClickAction={randomSubPush}
      />
      <NavigationGenericNavItem
        isStatic
        icon={faBug}
        text="Report Bug"
        title="Bugs"
        to="https://github.com/jeffrigby/reacddit/issues"
      />
      {!isMobile && (
        <NavigationGenericNavItem
          isStatic
          icon={faKeyboard}
          text="Hotkeys"
          title="Show Hotkeys"
          to="/hotkeys"
          onClickAction={openHotkeys}
        />
      )}
    </ul>
  );
}

export default NavigationPrimaryLinks;

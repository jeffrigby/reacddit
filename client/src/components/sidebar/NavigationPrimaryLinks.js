import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from 'react-device-detect';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { hotkeyStatus } from '../../common';

function NavigationPrimaryLinks({
  me,
  gotoLink,
  subreddits,
  sort,
  t,
  redditBearer,
}) {
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
    jQuery('#hotkeys').modal();
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

NavigationPrimaryLinks.propTypes = {
  me: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  t: PropTypes.string,
  subreddits: PropTypes.object.isRequired,
  gotoLink: PropTypes.func.isRequired,
  redditBearer: PropTypes.object.isRequired,
};

NavigationPrimaryLinks.defaultProps = {
  t: '',
};

const mapStateToProps = (state) => ({
  me: state.redditMe.me,
  redditBearer: state.redditBearer,
  sort: state.listingsFilter.sort,
  t: state.listingsFilter.t,
  subreddits: state.subreddits,
});

export default connect(mapStateToProps, {
  gotoLink: push,
})(NavigationPrimaryLinks);

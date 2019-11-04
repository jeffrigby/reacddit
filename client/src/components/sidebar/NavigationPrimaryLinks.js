import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { isMobile } from 'react-device-detect';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { hotkeyStatus } from '../../common';

const { API_PATH } = process.env;

class NavigationPrimaryLinks extends React.PureComponent {
  lastKeyPressed = null;

  componentDidMount() {
    document.addEventListener('keydown', this.handleNavPrimaryHotkey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleNavPrimaryHotkey);
  }

  /**
   * Configure the navigation hotkeys.
   * @param event
   */
  handleNavPrimaryHotkey = event => {
    const { me, gotoLink } = this.props;
    const { key } = event;

    if (hotkeyStatus()) {
      // Navigation key commands
      if (this.lastKeyPressed === 'g') {
        switch (key) {
          case 'h':
            gotoLink('/');
            break;
          case 'p':
            gotoLink(`/r/popular`);
            break;
          case 'r':
            this.randomSubPush();
            break;
          default:
            break;
        }
      }

      if (key === 'L') {
        window.location.href = me.name
          ? `${API_PATH}/logout`
          : `${API_PATH}/login`;
      }

      this.lastKeyPressed = key;
    }
  };

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @returns {*}
   */
  randomSubPush = e => {
    if (e) e.preventDefault();
    const { subreddits, sort, t, gotoLink } = this.props;
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
  };

  openHotkeys = e => {
    if (e) e.preventDefault();
    jQuery('#hotkeys').modal();
  };

  render() {
    const { me, sort } = this.props;
    const currentSort = sort && sort !== 'relevance' ? sort : '';
    const loginLink = `${API_PATH}/login${isMobile ? '?mobile' : ''}`;

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
          onClickAction={this.randomSubPush}
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
          onClickAction={this.openHotkeys}
          isStatic
        />
      </ul>
    );
  }
}

NavigationPrimaryLinks.propTypes = {
  me: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  t: PropTypes.string,
  subreddits: PropTypes.object.isRequired,
  gotoLink: PropTypes.func.isRequired,
};

NavigationPrimaryLinks.defaultProps = {
  t: '',
};

const mapStateToProps = state => ({
  me: state.redditMe.me,
  sort: state.listingsFilter.sort,
  t: state.listingsFilter.t,
  subreddits: state.subreddits,
});

export default connect(
  mapStateToProps,
  {
    gotoLink: push,
  }
)(NavigationPrimaryLinks);

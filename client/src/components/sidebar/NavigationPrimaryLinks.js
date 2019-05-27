import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import Friends from './Friends';

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
    const { disableHotkeys, me, ...props } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      // Navigation key commands
      if (this.lastKeyPressed === 'g') {
        // Logged in only
        if (me.name) {
          const { name } = me;
          switch (pressedKey) {
            case 'f':
              props.push('/r/friends');
              break;
            case 'u':
              props.push(`/user/${name}/upvoted`);
              break;
            case 'd':
              props.push(`/user/${name}/downvoted`);
              break;
            case 'b':
              props.push(`/user/${name}/submitted`);
              break;
            case 's':
              props.push(`/user/${name}/saved`);
              break;
            default:
              break;
          }
        }

        switch (pressedKey) {
          case 'h':
            props.push('/');
            break;
          case 'p':
            props.push(`/r/popular`);
            break;
          case 'r':
            this.randomSubPush();
            break;
          default:
            break;
        }
      }

      switch (pressedKey) {
        case 'L': // shift-L
          window.location.href = me.name ? '/api/logout' : '/api/login';
          break;
        default:
          break;
      }

      this.lastKeyPressed = pressedKey;
    }
  };

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @returns {*}
   */
  randomSubPush = e => {
    if (e) e.preventDefault();
    const { subreddits, sort, t, ...props } = this.props;
    if (isEmpty(subreddits.subreddits)) {
      return false;
    }

    const keys = Object.keys(subreddits.subreddits);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomSubreddit = subreddits.subreddits[randomKey];

    const sortTopQS =
      sort === 'top' || sort === 'controversial' ? `?t=${t}` : '';

    const url = randomSubreddit.url + (sort || 'hot') + sortTopQS;
    return props.push(url);
  };

  render() {
    const { me, sort } = this.props;
    const currentSort = sort && sort !== 'relevance' ? sort : '';

    return (
      <ul className="nav flex-column">
        {!me.name && (
          <NavigationGenericNavItem
            to="/api/login"
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
        {me.name && (
          <>
            <Friends />
            <NavigationGenericNavItem
              to={`/user/${me.name}/submitted/${currentSort}`}
              text="Submitted"
              title="Show My Submitted Posts"
              iconClass="far fa-file"
            />
            <NavigationGenericNavItem
              to={`/user/${me.name}/upvoted/${currentSort}`}
              text="Upvoted"
              title="Show My Upvoted Posts"
              iconClass="far fa-thumbs-up"
            />
            <NavigationGenericNavItem
              to={`/user/${me.name}/downvoted/${currentSort}`}
              text="Downvoted"
              title="Show My Downvoted Posts"
              iconClass="far fa-thumbs-down"
            />
            <NavigationGenericNavItem
              to={`/user/${me.name}/saved/${currentSort}`}
              text="Saved"
              title="Show My Saved Posts"
              iconClass="far fa-bookmark"
            />
            <NavigationGenericNavItem
              to="/api/logout"
              text="Logout"
              title="Logout"
              isStatic
              iconClass="fas fa-sign-out-alt"
            />
          </>
        )}
      </ul>
    );
  }
}

NavigationPrimaryLinks.propTypes = {
  me: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  t: PropTypes.string,
  subreddits: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
};

NavigationPrimaryLinks.defaultProps = {
  t: '',
};

const mapStateToProps = state => ({
  me: state.redditMe.me,
  sort: state.listingsFilter.sort,
  t: state.listingsFilter.t,
  disableHotkeys: state.disableHotKeys,
  subreddits: state.subreddits,
});

export default connect(
  mapStateToProps,
  {
    push,
  }
)(NavigationPrimaryLinks);

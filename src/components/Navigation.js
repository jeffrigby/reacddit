import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import isEmpty from 'lodash.isempty';
import {
  subredditsFetchData,
  subredditsFetchDefaultData,
} from '../redux/actions/subreddits';
import { debugMode, disableHotKeys } from '../redux/actions/misc';
import NavigationItem from './NavigationItem';
import MultiReddits from './MultiReddits';
import RedditAPI from '../reddit/redditAPI';

class Navigation extends React.Component {
  /**
   * Resize the the right navbar when the window is resized
   */
  static resizeNavigation() {
    let vph;
    vph = jQuery(window).height();
    vph -= 150;
    jQuery('#subreddits nav').css('max-height', `${vph}px`);
  }

  /**
   * Helper function to generate the list items for the nav.
   * @param links
   *   Links in the following format
   *  [text, link, title, key]
   *  ['Front', `/${sort}`, `Show All Subreddits`]
   * @returns {Array}
   *  The rendered links
   */
  static generateListItems(links) {
    const linksListItem = [];
    if (links) {
      links.forEach((elm, index) => {
        const text = elm[0];
        const to = elm[1];
        const title = elm[2] || elm[0];
        const key = elm[3] || elm[0];
        const itemKey = `loggedin-${key}`;
        linksListItem.push(
          <li key={itemKey}>
            <div>
              <NavLink to={to} title={title} activeClassName="activeSubreddit">
                {text}
              </NavLink>
            </div>
          </li>
        );
      });
    }
    return linksListItem;
  }

  constructor(props) {
    super(props);
    this.randomSub = this.randomSub.bind(this);
    this.filterData = this.filterData.bind(this);
    this.handleNavHotkey = this.handleNavHotkey.bind(this);
    this.handleNavHotkeyKeyDown = this.handleNavHotkeyKeyDown.bind(this);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.enableHotkeys = this.enableHotkeys.bind(this);
    this.disableHotkeys = this.disableHotkeys.bind(this);
    this.accessToken = null;
    this.lastKeyPressed = null;
    this.filterActive = false;
    this.subredditTarget = null;
    this.state = {
      subredditsFilter: '',
      subredditTargetIdx: 0,
    };
  }

  async componentDidMount() {
    const { fetchSubreddits, fetchDefaultSubreddits } = this.props;
    jQuery(document).keypress(this.handleNavHotkey);
    jQuery(document).keydown(this.handleNavHotkeyKeyDown);
    jQuery(window).on('load resize', Navigation.resizeNavigation);
    this.accessToken = await RedditAPI.getToken(false);

    if (this.accessToken && this.accessToken.substr(0, 1) !== '-') {
      fetchSubreddits(false);
    } else {
      fetchDefaultSubreddits();
    }
  }

  componentDidUpdate() {
    Navigation.resizeNavigation();
  }

  /**
   * Set the subreddit filter data.
   * @param item
   * @returns {void|*}
   */
  filterData(item) {
    const queryText = item.target.value;
    if (!queryText) {
      return this.setState({ subredditsFilter: '' });
    }
    return this.setState({ subredditsFilter: queryText });
  }

  /**
   * Handle the hot key events for navigating the subreddits
   * when a filter is applied
   * @param event
   */
  handleNavHotkeyKeyDown(event) {
    const { subredditTargetIdx } = this.state;
    const { ...props } = this.props;
    if (this.filterActive) {
      // up down arrows move the navigation
      const filter = jQuery('#subreddit-filter');
      switch (event.key) {
        case 'ArrowUp': {
          const nextIdx = subredditTargetIdx - 1;
          if (nextIdx >= 0) {
            this.setState({
              subredditTargetIdx: nextIdx,
            });
          }
          event.preventDefault();
          break;
        }
        case 'ArrowDown': {
          const nextIdx = subredditTargetIdx + 1;
          this.setState({
            subredditTargetIdx: nextIdx,
          });
          event.preventDefault();
          break;
        }
        case 'Enter':
        case 'ArrowRight': {
          props.push(this.subredditTarget);
          filter.blur();
          event.preventDefault();
          break;
        }
        case 'Escape':
          if (!filter.val()) {
            filter.blur();
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * Configure the navigation hotkeys.
   * @param event
   */
  handleNavHotkey(event) {
    const { disableHotkeys, sort, me, setDebug, debug, ...props } = this.props;
    const pressedKey = event.key;

    // Clear filter IDX
    if (this.filterActive) {
      this.setState({
        subredditTargetIdx: 0,
      });
    }

    if (!disableHotkeys) {
      const currentSort = sort || 'hot';

      // Navigation key commands
      if (this.lastKeyPressed === 'g') {
        // Logged in only
        if (me) {
          const { name } = me;
          switch (pressedKey) {
            case 'f':
              props.push('/r/friends');
              break;
            case 'u':
              props.push(`/user/${name}/upvoted/${currentSort}`);
              break;
            case 'd':
              props.push(`/user/${name}/downvoted/${currentSort}`);
              break;
            case 'b':
              props.push(`/user/${name}/submitted/${currentSort}`);
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
            props.push(`/r/popular/${currentSort}`);
            break;
          case 'r':
            this.randomSubPush();
            break;
          default:
            break;
        }
      }

      switch (pressedKey) {
        case 'Î': // opt-shift-d
          setDebug(!debug);
          break;
        case '?':
          jQuery('#hotkeys').modal();
          break;
        case 'R': // shift-R
          this.reloadSubreddits();
          break;
        case 'F':
          jQuery('#subreddit-filter').focus();
          this.setState({ subredditsFilter: '' });
          event.preventDefault();
          break;
        default:
          break;
      }

      // Not logged in globals
      if (!me.name) {
        switch (pressedKey) {
          case 'L': // shift-L
            window.location.href = '/api/login';
            break;
          default:
            break;
        }
      }

      this.lastKeyPressed = pressedKey;
    }
  }

  /**
   * Helper to clear the filter textbox
   */
  clearSearch() {
    this.setState({ subredditsFilter: '' });
  }

  /**
   * Disable the hotkeys when using the filter.
   */
  disableHotkeys() {
    const { setDisableHotkeys } = this.props;
    setDisableHotkeys(true);
    this.filterActive = true;
    this.subredditTarget = null;
    this.setState({
      subredditTargetIdx: 0,
    });
  }

  /**
   * Enable the hotkeys when not in a textbox.
   */
  enableHotkeys() {
    const { setDisableHotkeys } = this.props;
    setDisableHotkeys(false);
    this.filterActive = false;
    this.subredditTarget = null;
  }

  /**
   * Force reload all of the subreddits.
   */
  reloadSubreddits() {
    const { fetchSubreddits, fetchDefaultSubreddits } = this.props;
    if (this.accessToken) {
      fetchSubreddits(true);
    } else {
      fetchDefaultSubreddits();
    }
  }

  /**
   * Handle the click on the reload subreddits
   * @TODO why is this separate?
   * @param e
   */
  reloadSubredditsClick(e) {
    e.preventDefault();
    this.reloadSubreddits();
  }

  /**
   * Generate a filtered list of subreddits.
   * @param subreddits
   * @returns {*}
   */
  filterSubreddits(subreddits) {
    const { subredditsFilter } = this.state;
    if (isEmpty(subreddits)) {
      return {};
    }

    const filterText = subredditsFilter.toLowerCase();
    // No filter defined
    if (!filterText) {
      return subreddits;
    }

    const filteredSubreddits = {};

    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        if (
          subreddits[key].display_name.toLowerCase().indexOf(filterText) !== -1
        ) {
          filteredSubreddits[key] = subreddits[key];
        }
      }
    });

    return filteredSubreddits;
  }

  /**
   * Generate the subreddit nav items.
   * @param subreddits
   * @returns {Array}
   */
  generateNavItems(subreddits) {
    const { lastUpdated, sort, t } = this.props;
    const { subredditsFilter, subredditTargetIdx } = this.state;
    const navigationItems = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;
        const trigger =
          subredditTargetIdx === index &&
          (this.filterActive || !isEmpty(subredditsFilter));
        if (trigger) {
          let currentSort = sort || '';
          if (currentSort === 'top') {
            currentSort = `${currentSort}?t=${t}`;
          }
          this.subredditTarget = `${item.url}${currentSort}`;
        }
        navigationItems.push(
          <NavigationItem
            item={item}
            key={item.name}
            lastUpdated={subLastUpdated}
            trigger={trigger}
          />
        );
      }
    });

    return navigationItems;
  }

  /**
   * Handle the random sub click.
   * @TODO why is this separate?
   * @param e
   */
  randomSub(e) {
    e.preventDefault();
    this.randomSubPush();
  }

  /**
   * Load a random subreddit from the current users subscribed reddits.
   * @returns {*}
   */
  randomSubPush() {
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
  }

  /**
   * Render the navigation.
   * @returns {*}
   */
  render() {
    const { subreddits, me, sort } = this.props;
    const { subredditsFilter } = this.state;

    if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
      return (
        <div id="subreddits">
          <div
            className="alert alert-info"
            id="subreddits-loading"
            role="alert"
          >
            <i className="fas fa-spinner fa-spin" /> Loading Subreddits
          </div>
        </div>
      );
    }
    if (subreddits.status === 'error') {
      return (
        <div
          className="alert alert-danger small"
          id="subreddits-load-error"
          role="alert"
        >
          <i className="fas fa-exclamation-triangle" /> Error loading subreddits<br />
          <button
            className="astext"
            onClick={this.reloadSubredditsClick}
            type="button"
          >
            try again.
          </button>
        </div>
      );
    }

    const filterText = subredditsFilter;
    const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
    const navItems = this.generateNavItems(filteredSubreddits);
    const currentSort = sort && sort !== 'relavance' ? sort : '';
    const noItems = isEmpty(navItems);
    const loggedIn = this.accessToken && this.accessToken.substr(0, 1) !== '-';

    const topLinks = [];
    if (!loggedIn) {
      topLinks.push(
        <li key="login">
          <div>
            <a
              href="/api/login"
              title="Login to reddit to see your subreddits. ⇧L"
            >
              Reddit Login
            </a>
          </div>
        </li>
      );
    }

    topLinks.push(
      Navigation.generateListItems([
        ['Front', `/${sort}`, `Show All Subreddits`],
        ['Popular', `/r/popular/${currentSort}`],
      ])
    );

    topLinks.push(
      <li key="random">
        <div>
          <a href="/r/myrandom" onClick={this.randomSub}>
            Random
          </a>
        </div>
      </li>
    );

    if (me.name && loggedIn) {
      topLinks.push(
        Navigation.generateListItems([
          ['Friends', `/r/friends/${currentSort}`, `Show Friend's Posts`],
          ['Submitted', `/user/${me.name}/submitted/${currentSort}`],
          ['Upvoted', `/user/${me.name}/upvoted/${currentSort}`],
          ['Downvoted', `/user/${me.name}/downvoted/${currentSort}`],
          ['Saved', `/user/${me.name}/saved`],
          ['Logout', `/api/logout`],
        ])
      );
    }

    const hideExtras =
      this.filterActive || (!this.filterActive && !isEmpty(filterText));

    return (
      <div id="subreddits">
        <div id="subreddit-filter-group">
          <div className="form-group-sm">
            <input
              type="search"
              className="form-control"
              onChange={this.filterData}
              onFocus={this.disableHotkeys}
              onBlur={this.enableHotkeys}
              placeholder="Filter Subreddits"
              id="subreddit-filter"
              value={filterText}
            />
            {filterText && (
              <button id="searchclear" onClick={this.clearSearch} type="button">
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>

          {noItems && (
            <div>
              <div className="nav-divider" />
              <div
                className="alert alert-info"
                id="subreddits-end"
                role="alert"
              >
                <i className="fas fa-info-circle" />
                {' No subreddits found'}
              </div>
            </div>
          )}

          <nav className="navigation subreddits-nav hidden-print" id="side-nav">
            {!hideExtras && <ul className="nav">{topLinks}</ul>}
            {!hideExtras && <div className="nav-divider" />}
            {loggedIn && !hideExtras && <MultiReddits />}
            <ul className="nav">{navItems}</ul>
          </nav>
          <div>
            <button
              className="astext"
              onClick={this.reloadSubredditsClick}
              type="button"
            >
              Reload Subreddits
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Navigation.propTypes = {
  sort: PropTypes.string.isRequired,
  t: PropTypes.string,
  fetchSubreddits: PropTypes.func.isRequired,
  fetchDefaultSubreddits: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  me: PropTypes.object.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  setDebug: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
  t: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  t: state.listingsFilter.t,
  subreddits: state.subreddits,
  me: state.redditMe.me,
  lastUpdated: state.lastUpdated,
  debug: state.debugMode,
  disableHotkeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: reset => dispatch(subredditsFetchData(reset)),
  fetchDefaultSubreddits: () => dispatch(subredditsFetchDefaultData()),
  setDebug: debug => dispatch(debugMode(debug)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
  push: url => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

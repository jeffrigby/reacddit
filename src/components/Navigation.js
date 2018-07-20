import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import isEmpty from 'lodash.isempty';
import {
  subredditsFetchData,
  subredditsFetchDefaultData,
} from '../redux/actions/subreddits';
import { debugMode, disableHotKeys } from '../redux/actions/auth';
import NavigationItem from './NavigationItem';
import MultiReddits from './MultiReddits';
import RedditAPI from '../reddit/redditAPI';

class Navigation extends React.Component {
  static resizeNavigation() {
    let vph;
    vph = jQuery(window).height();
    vph -= 150;
    jQuery('#subreddits nav').css('max-height', `${vph}px`);
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
    this.redditUser = null;
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
    this.accessToken = await RedditAPI.getToken();
    if (this.accessToken) {
      fetchSubreddits(false);
    } else {
      fetchDefaultSubreddits();
    }
  }

  componentDidUpdate() {
    Navigation.resizeNavigation();
  }

  filterData(item) {
    const queryText = item.target.value;
    if (!queryText) {
      return this.setState({ subredditsFilter: '' });
    }
    return this.setState({ subredditsFilter: queryText });
  }

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
            window.location.href = '/api/reddit-login';
            break;
          default:
            break;
        }
      }

      this.lastKeyPressed = pressedKey;
    }
  }

  clearSearch() {
    this.setState({ subredditsFilter: '' });
  }

  disableHotkeys() {
    const { setDisableHotkeys } = this.props;
    setDisableHotkeys(true);
    this.filterActive = true;
    this.subredditTarget = null;
    this.setState({
      subredditTargetIdx: 0,
    });
  }

  enableHotkeys() {
    const { setDisableHotkeys } = this.props;
    setDisableHotkeys(false);
    this.filterActive = false;
    this.subredditTarget = null;
  }

  reloadSubreddits() {
    const { fetchSubreddits, fetchDefaultSubreddits } = this.props;
    if (this.accessToken) {
      fetchSubreddits(true);
    } else {
      fetchDefaultSubreddits();
    }
  }

  reloadSubredditsClick(e) {
    e.preventDefault();
    this.reloadSubreddits();
  }

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

  generateNavItems(subreddits) {
    const { lastUpdated, sort, sortTop } = this.props;
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
            currentSort = `${currentSort}?t=${sortTop}`;
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

  randomSub(e) {
    e.preventDefault();
    this.randomSubPush();
  }

  randomSubPush() {
    const { subreddits, sort, ...props } = this.props;
    if (isEmpty(subreddits.subreddits)) {
      return false;
    }
    const keys = Object.keys(subreddits.subreddits);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomSubreddit = subreddits.subreddits[randomKey];
    const url = randomSubreddit.url + (sort || 'hot');
    // @todo add the top sorting.
    return props.push(url);
  }

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
            <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" />{' '}
            Loading Subreddits
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
          <span className="glyphicon glyphicon glyphicon-alert" /> Error loading
          subreddits<br />
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
    const currentSort = sort || 'hot';
    const noItems = isEmpty(navItems);
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
                <span className="glyphicon glyphicon-remove-circle" />
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
                <span className="glyphicon glyphicon-info-sign" />
                {' No subreddits found'}
              </div>
            </div>
          )}

          <nav className="navigation subreddits-nav hidden-print" id="side-nav">
            {!hideExtras && (
              <ul className="nav">
                {!this.accessToken && (
                  <li>
                    <div id="login">
                      <a href="/api/reddit-login">Login</a> to view your
                      subreddits.
                    </div>
                  </li>
                )}
                <li>
                  <div>
                    <NavLink
                      to={`/r/mine/${currentSort}`}
                      title="Show all subreddits"
                      activeClassName="activeSubreddit"
                    >
                      Front
                    </NavLink>
                  </div>
                </li>
                <li>
                  <div>
                    <NavLink
                      to={`/r/popular/${currentSort}`}
                      title="Show popular posts"
                    >
                      Popular
                    </NavLink>
                  </div>
                </li>
                <li>
                  <div>
                    <a href="/r/myrandom" onClick={this.randomSub}>
                      Random
                    </a>
                  </div>
                </li>
                {this.accessToken && (
                  <li>
                    <div>
                      <NavLink
                        to={`/r/friends/${currentSort}`}
                        title="Show Friends Posts"
                        activeClassName="activeSubreddit"
                      >
                        Friends
                      </NavLink>
                    </div>
                  </li>
                )}
                {me.name && (
                  <li>
                    <div>
                      <NavLink
                        to={`/user/${me.name}/submitted/${currentSort}`}
                        title="Submitted"
                        activeClassName="activeSubreddit"
                      >
                        Submitted
                      </NavLink>
                    </div>
                  </li>
                )}
                {me.name && (
                  <li>
                    <div>
                      <NavLink
                        to={`/user/${me.name}/upvoted/${currentSort}`}
                        title="Upvoted"
                        activeClassName="activeSubreddit"
                      >
                        Upvoted
                      </NavLink>
                    </div>
                  </li>
                )}
                {me.name && (
                  <li>
                    <div>
                      <NavLink
                        to={`/user/${me.name}/downvoted/${currentSort}`}
                        title="Downvoted"
                        activeClassName="activeSubreddit"
                      >
                        Downvoted
                      </NavLink>
                    </div>
                  </li>
                )}
                {me.name && (
                  <li>
                    <div>
                      <NavLink
                        to={`/user/${me.name}/saved`}
                        title="Saved"
                        activeClassName="activeSubreddit"
                      >
                        Saved
                      </NavLink>
                    </div>
                  </li>
                )}
              </ul>
            )}
            {!hideExtras && <div className="nav-divider" />}

            {this.accessToken && !hideExtras && <MultiReddits />}

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
  sortTop: PropTypes.string,
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
  sortTop: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  sortTop: state.listingsFilter.sortTop,
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

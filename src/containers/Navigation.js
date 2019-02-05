import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import isEmpty from 'lodash.isempty';
import {
  subredditsFetchData,
  subredditsFetchDefaultData,
  subredditsFilter,
} from '../redux/actions/subreddits';
import { debugMode, disableHotKeys } from '../redux/actions/misc';
import NavigationItem from '../components/sidebarMenu/NavigationItem';
import MultiReddits from '../components/sidebarMenu/MultiReddits';
import RedditAPI from '../reddit/redditAPI';
// import NavigationSubReddits from '../components/sidebarMenu/NavigationSubreddits';
import NavigationPrimaryLinks from '../components/sidebarMenu/NavigationPrimaryLinks';
import '../styles/sidebar.scss';

const queryString = require('query-string');

class Navigation extends React.Component {
  /**
   * Resize the the right navbar when the window is resized
   */
  static resizeNavigation() {
    // let vph;
    // vph = jQuery(window).height();
    // vph -= 150;
    // jQuery('#subreddits nav').css('max-height', `${vph}px`);
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
          <li key={itemKey} className="nav-item">
            <NavLink
              to={to}
              title={title}
              className="nav-link"
              activeClassName="activeSubreddit"
            >
              {text}
            </NavLink>
          </li>
        );
      });
    }
    return linksListItem;
  }

  constructor(props) {
    super(props);
    this.handleNavHotkey = this.handleNavHotkey.bind(this);
    this.handleNavHotkeyKeyDown = this.handleNavHotkeyKeyDown.bind(this);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.accessToken = null;
    this.filterActive = false;
    this.subredditTarget = null;
    this.state = {
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
   * Handle the hot key events for navigating the subreddits
   * when a filter is applied
   * @param event
   */
  handleNavHotkeyKeyDown(event) {
    const { subredditTargetIdx } = this.state;
    const { subredditsFilterActive, ...props } = this.props;
    if (subredditsFilterActive) {
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
    const {
      disableHotkeys,
      setDebug,
      debug,
      subredditsFilterActive,
    } = this.props;
    const pressedKey = event.key;

    // Clear filter IDX
    if (subredditsFilterActive) {
      this.setState({
        subredditTargetIdx: 0,
      });
    }

    if (!disableHotkeys) {
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
        default:
          break;
      }
    }
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
    const { subredditsFilterText } = this.props;
    if (isEmpty(subreddits)) {
      return {};
    }

    const filterText = subredditsFilterText.toLowerCase();
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
    const { lastUpdated, sort, subredditsFilterText, location } = this.props;
    const query = queryString.parse(location.search);
    const { t } = query;

    const { subredditTargetIdx } = this.state;
    const navigationItems = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;
        const trigger =
          subredditTargetIdx === index &&
          (this.filterActive || !isEmpty(subredditsFilterText));
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
   * Render the navigation.
   * @returns {*}
   */
  render() {
    const { subreddits, subredditsFilterText } = this.props;

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
          <i className="fas fa-exclamation-triangle" /> Error loading subreddits
          <br />
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

    const filterText = subredditsFilterText;
    const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
    const navItems = this.generateNavItems(filteredSubreddits);
    const noItems = isEmpty(navItems);
    const loggedIn = this.accessToken && this.accessToken.substr(0, 1) !== '-';

    const hideExtras =
      this.filterActive || (!this.filterActive && !isEmpty(filterText));

    return (
      <div className="w-100">
        {noItems && (
          <div>
            <div className="nav-divider" />
            <div className="alert alert-info" id="subreddits-end" role="alert">
              <i className="fas fa-info-circle" />
              {' No subreddits found'}
            </div>
          </div>
        )}
        {!hideExtras && <NavigationPrimaryLinks />}
        {!hideExtras && <div className="nav-divider" />}
        {loggedIn && !hideExtras && <MultiReddits />}
        <div className="sidebar-heading d-flex text-muted">
          <span className="mr-auto">Subreddits</span>
          <span>
            <button
              className="btn btn-link btn-sm m-0 p-0 text-muted"
              onClick={this.reloadSubredditsClick}
              type="button"
            >
              <i className="fas fa-sync-alt" />
            </button>
          </span>
        </div>
        <ul className="nav flex-column">{navItems}</ul>
      </div>
    );
  }
}

Navigation.propTypes = {
  sort: PropTypes.string.isRequired,
  location: PropTypes.object,
  subredditsFilterText: PropTypes.string,
  fetchSubreddits: PropTypes.func.isRequired,
  fetchDefaultSubreddits: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  me: PropTypes.object.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  subredditsFilterActive: PropTypes.bool.isRequired,
  setDebug: PropTypes.func.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
  location: {},
  subredditsFilterText: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  subreddits: state.subreddits,
  me: state.redditMe.me,
  lastUpdated: state.lastUpdated,
  debug: state.debugMode,
  disableHotkeys: state.disableHotKeys,
  subredditsFilterText: state.subredditsFilter,
  subredditsFilterActive: state.subredditsFilterActive,
  location: state.router.location,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: reset => dispatch(subredditsFetchData(reset)),
  fetchDefaultSubreddits: () => dispatch(subredditsFetchDefaultData()),
  setDebug: debug => dispatch(debugMode(debug)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
  push: url => dispatch(push(url)),
  setFilter: filter => dispatch(subredditsFilter(filter)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

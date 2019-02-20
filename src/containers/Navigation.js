import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import isEmpty from 'lodash.isempty';
import * as subredditsActions from '../redux/actions/subreddits';
import { disableHotKeys } from '../redux/actions/misc';
import NavigationItem from '../components/sidebarMenu/NavigationItem';
import MultiReddits from '../components/sidebarMenu/MultiReddits';
// import RedditAPI from '../reddit/redditAPI';
// import NavigationSubReddits from '../components/sidebarMenu/NavigationSubreddits';
import NavigationPrimaryLinks from '../components/sidebarMenu/NavigationPrimaryLinks';
import '../styles/sidebar.scss';

const queryString = require('query-string');

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.handleNavHotkey = this.handleNavHotkey.bind(this);
    this.handleNavHotkeyKeyDown = this.handleNavHotkeyKeyDown.bind(this);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.accessToken = null;
    this.subredditTarget = null;
  }

  async componentDidMount() {
    const { fetchSubreddits, redditBearer } = this.props;
    jQuery(document).keypress(this.handleNavHotkey);
    jQuery(document).keydown(this.handleNavHotkeyKeyDown);

    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(false, where);
  }

  /**
   * Handle the hot key events for navigating the subreddits
   * when a filter is applied
   * @param event
   */
  handleNavHotkeyKeyDown(event) {
    const { subredditsFilter, ...props } = this.props;

    if (subredditsFilter.active) {
      // up down arrows move the navigation
      const filter = jQuery('#subreddit-filter');
      switch (event.key) {
        case 'Enter':
        case 'ArrowRight': {
          props.push(this.subredditTarget);
          filter.blur();
          event.preventDefault();
          break;
        }
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
    const { disableHotkeys } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
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
    const { fetchSubreddits, redditBearer } = this.props;
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(true, where);
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
    const { subredditsFilter } = this.props;
    if (isEmpty(subreddits)) {
      return {};
    }

    const filterText = subredditsFilter.filterText.toLowerCase();
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
    const { lastUpdated, sort, subredditsFilter, location } = this.props;
    const query = queryString.parse(location.search);
    const { t } = query;

    const navigationItems = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;
        const trigger =
          subredditsFilter.activeIndex === index &&
          (subredditsFilter.active || !isEmpty(subredditsFilter.filterText));
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
    const { subreddits, subredditsFilter } = this.props;

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

    const { filterText } = subredditsFilter;
    const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
    const navItems = this.generateNavItems(filteredSubreddits);
    const noItems = isEmpty(navItems);
    const loggedIn = this.accessToken && this.accessToken.substr(0, 1) !== '-';

    const hideExtras = !isEmpty(filterText);

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
  subredditsFilter: PropTypes.object.isRequired,
  fetchSubreddits: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  me: PropTypes.object.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  setDisableHotkeys: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  redditBearer: PropTypes.object.isRequired,
};

Navigation.defaultProps = {
  location: {},
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  subreddits: state.subreddits,
  me: state.redditMe.me,
  lastUpdated: state.lastUpdated,
  disableHotkeys: state.disableHotKeys,
  subredditsFilter: state.subredditsFilter,
  location: state.router.location,
  redditBearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsActions.subredditsFetchData(reset, where)),
  setDisableHotkeys: disable => dispatch(disableHotKeys(disable)),
  push: url => dispatch(push(url)),
  setFilter: filter => dispatch(subredditsActions.subredditsFilter(filter)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

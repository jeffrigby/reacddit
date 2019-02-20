import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import isEmpty from 'lodash.isempty';
import * as subredditsActions from '../redux/actions/subreddits';
import { disableHotKeys } from '../redux/actions/misc';
import NavigationItem from '../components/sidebarMenu/NavigationItem';
import MultiReddits from '../components/sidebarMenu/MultiReddits';
import NavigationPrimaryLinks from '../components/sidebarMenu/NavigationPrimaryLinks';
import '../styles/sidebar.scss';
import NavigationSubReddits from '../components/sidebarMenu/NavigationSubreddits';

const queryString = require('query-string');

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.handleNavHotkeyKeyDown = this.handleNavHotkeyKeyDown.bind(this);
    this.accessToken = null;
    this.subredditTarget = null;
  }

  async componentDidMount() {
    jQuery(document).keydown(this.handleNavHotkeyKeyDown);
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
    const { subreddits, subredditsFilter, redditBearer } = this.props;

    let content;

    if (subreddits.status === 'loaded') {
      const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
      const navItems = this.generateNavItems(filteredSubreddits);
      const noItems = isEmpty(navItems);
      if (noItems) {
        content = (
          <div className="alert alert-info" id="subreddits-end" role="alert">
            <i className="fas fa-info-circle" />
            {' No subreddits found'}
          </div>
        );
      } else {
        content = <ul className="nav flex-column">{navItems}</ul>;
      }
    }

    const { filterText } = subredditsFilter;
    const hideExtras = !isEmpty(filterText);
    const loggedIn = redditBearer.status === 'auth' || false;

    return (
      <div className="w-100">
        {!hideExtras && <NavigationPrimaryLinks />}
        {!hideExtras && <div className="nav-divider" />}
        {loggedIn && !hideExtras && <MultiReddits />}
        <NavigationSubReddits />
        {content}
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
  lastUpdated: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  redditBearer: PropTypes.object.isRequired,
};

Navigation.defaultProps = {
  location: {},
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  subreddits: state.subreddits,
  lastUpdated: state.lastUpdated,
  disableHotkeys: state.disableHotKeys,
  subredditsFilter: state.subredditsFilter,
  location: state.router.location,
  redditBearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsActions.subredditsFetchData(reset, where)),
  push: url => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

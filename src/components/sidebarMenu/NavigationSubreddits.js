import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEmpty from 'lodash.isempty';
import { subredditsFetchData } from '../../redux/actions/subreddits';
import NavigationItem from './NavigationItem';

const queryString = require('query-string');

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.handleSubredditHotkey = this.handleSubredditHotkey.bind(this);
  }

  componentDidMount() {
    const { fetchSubreddits, redditBearer } = this.props;
    document.addEventListener('keydown', this.handleSubredditHotkey);
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(false, where);
  }

  /**
   * Configure the navigation hotkeys.
   * @param event
   */
  handleSubredditHotkey(event) {
    const { disableHotkeys } = this.props;
    const pressedKey = event.key;

    if (!disableHotkeys) {
      switch (pressedKey) {
        case '®': // alt-r (option)
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

  isSubredditFiltered(subreddit) {
    const { subredditsFilter } = this.props;
    const filterText = subredditsFilter.filterText.toLowerCase();
    // No filter defined

    if (!filterText) {
      return false;
    }

    if (subreddit.display_name.toLowerCase().indexOf(filterText) !== -1) {
      return false;
    }

    return true;
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
    let idx = 0;
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        if (this.isSubredditFiltered(item)) return;
        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;
        const trigger =
          subredditsFilter.activeIndex === idx &&
          (subredditsFilter.active || !isEmpty(subredditsFilter.filterText));
        if (trigger) {
          let currentSort = sort || '';
          if (currentSort === 'top') {
            currentSort = `${currentSort}?t=${t}`;
          }
          this.subredditTarget = `${item.url}${currentSort}`;
        }
        idx += 1;
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

  render() {
    const { subreddits } = this.props;

    let content;
    if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
      content = (
        <div className="alert alert-info" id="subreddits-loading" role="alert">
          <i className="fas fa-spinner fa-spin" /> Loading Subreddits
        </div>
      );
    } else if (subreddits.status === 'error') {
      content = (
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
    } else if (subreddits.status === 'loaded') {
      // const filteredSubreddits = this.filterSubreddits(subreddits.subreddits);
      const navItems = this.generateNavItems(subreddits.subreddits);
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

    let spinnerClass = 'fas fa-sync-alt reload';
    if (subreddits.status === 'loading') {
      spinnerClass += ' fa-spin';
    }

    return (
      <div id="sidebar-subreddits">
        <div className="sidebar-heading d-flex text-muted">
          <span className="mr-auto">Subreddits</span>
          <span>
            <button
              className="btn btn-link btn-sm m-0 p-0 text-muted"
              onClick={this.reloadSubredditsClick}
              type="button"
            >
              <i className={spinnerClass} />
            </button>
          </span>
        </div>
        {content}
      </div>
    );
  }
}

NavigationSubReddits.propTypes = {
  disableHotkeys: PropTypes.bool.isRequired,
  fetchSubreddits: PropTypes.func.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  redditBearer: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  subreddits: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

NavigationSubReddits.defaultProps = {};

const mapStateToProps = state => ({
  disableHotkeys: state.disableHotKeys,
  lastUpdated: state.lastUpdated,
  location: state.router.location,
  redditBearer: state.redditBearer,
  sort: state.listingsFilter.sort,
  subreddits: state.subreddits,
  subredditsFilter: state.subredditsFilter,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsFetchData(reset, where)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationSubReddits);

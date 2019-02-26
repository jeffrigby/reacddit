import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEmpty from 'lodash.isempty';
import {
  subredditsFetchData,
  subredditsFetchLastUpdated,
} from '../../redux/actions/subreddits';
import NavigationItem from './NavigationItem';

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.handleSubredditHotkey = this.handleSubredditHotkey.bind(this);
    this.checkLastUpdated = null;
  }

  componentDidMount() {
    const { fetchSubreddits, redditBearer, fetchLastUpdated } = this.props;
    document.addEventListener('keydown', this.handleSubredditHotkey);
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(false, where);
    this.checkLastUpdated = setInterval(fetchLastUpdated, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.checkLastUpdated);
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

  /**
   * Generate the subreddit nav items.
   * @param subreddits
   * @returns {Array}
   */
  generateNavItems(subreddits) {
    const { lastUpdated, filter } = this.props;

    const navigationItems = [];

    Object.values(subreddits).forEach((item, index) => {
      const subLastUpdated = lastUpdated[item.name]
        ? lastUpdated[item.name].lastPost
        : 0;

      const trigger =
        filter.activeIndex === index &&
        filter.active &&
        !isEmpty(filter.filterText);
      navigationItems.push(
        <NavigationItem
          item={item}
          key={item.name}
          lastUpdated={subLastUpdated}
          trigger={trigger}
        />
      );
    });

    return navigationItems;
  }

  render() {
    const { subreddits, filteredSubreddits } = this.props;

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

const filterSubs = (subreddits, filterText) => {
  if (isEmpty(subreddits)) {
    return {};
  }

  if (filterText === '') {
    return subreddits;
  }

  return Object.keys(subreddits)
    .filter(
      subreddit =>
        subreddits[subreddit].display_name
          .toLowerCase()
          .indexOf(filterText.toLowerCase()) > -1
    )
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: subreddits[key],
      };
    }, {});
};

NavigationSubReddits.propTypes = {
  disableHotkeys: PropTypes.bool.isRequired,
  fetchSubreddits: PropTypes.func.isRequired,
  fetchLastUpdated: PropTypes.func.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  redditBearer: PropTypes.object.isRequired,
  subreddits: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  filteredSubreddits: PropTypes.object.isRequired,
};

NavigationSubReddits.defaultProps = {};

const mapStateToProps = state => ({
  disableHotkeys: state.disableHotKeys,
  lastUpdated: state.lastUpdated,
  redditBearer: state.redditBearer,
  subreddits: state.subreddits,
  filter: state.subredditsFilter,
  filteredSubreddits: filterSubs(
    state.subreddits.subreddits,
    state.subredditsFilter.filterText
  ),
});

export default connect(
  mapStateToProps,
  {
    fetchSubreddits: subredditsFetchData,
    fetchLastUpdated: subredditsFetchLastUpdated,
  }
)(NavigationSubReddits);

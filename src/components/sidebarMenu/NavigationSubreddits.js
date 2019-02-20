import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import NavigationItem from '../../containers/Navigation';
import * as subredditsActions from '../../redux/actions/subreddits';

const queryString = require('query-string');

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
    this.reloadSubredditsClick = this.reloadSubredditsClick.bind(this);
    this.filterSubreddits = this.filterSubreddits.bind(this);
    this.isSubredditFiltered = this.isSubredditFiltered.bind(this);
    this.subredditTarget = null;
  }

  async componentDidMount() {
    const { fetchSubreddits, redditBearer } = this.props;
    const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
    fetchSubreddits(false, where);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { subreddits, subredditsFilter } = this.props;
    if (!isEqual(nextProps.subreddits, subreddits)) {
      console.log(nextProps.subreddits, subreddits);
      return true;
    }

    if (nextProps.subredditsFilter.filterText !== subredditsFilter.filterText) {
      console.log(
        nextProps.subredditsFilter.filterText,
        subredditsFilter.filterText
      );
      return true;
    }
    console.log('false');
    return false;
  }

  // componentDidUpdate(prevProps) {
  // const { subreddits, subredditsFilter } = this.props;
  // const { filteredSubreddits } = this.state;
  //
  // let filtered;
  //
  // if (subreddits.status === 'loaded') {
  //   if (filteredSubreddits === null) {
  //     filtered = this.filterSubreddits(subreddits.subreddits);
  //     this.setState({ filteredSubreddits: filtered });
  //   } else if (
  //     prevProps.subredditsFilter.filterText !== subredditsFilter.filterText
  //   ) {
  //     filtered = this.filterSubreddits(subreddits.subreddits);
  //     this.setState({ filteredSubreddits: filtered });
  //   }
  // }
  //
  // if (
  //   subreddits.status === 'loaded' &&
  //   prevProps.subredditsFilter.filterText !== subredditsFilter.filterText
  // ) {
  //   const filteredSubs = this.filterSubreddits(subreddits.subreddits);
  //   this.setState({ filteredSubreddits: filteredSubs });
  // }
  // }

  /**
   * Force reload all of the subreddits.
   */
  reloadSubreddits() {
    const { fetchSubreddits, redditBearer } = this.props;
    if (redditBearer.status === 'anon') {
      fetchSubreddits(true, 'default');
    } else {
      fetchSubreddits(true, 'subscriber');
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
    let subIdx = 0;

    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const item = subreddits[key];
        if (this.isSubredditFiltered(item)) {
          return null;
        }

        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;

        const trigger =
          subredditsFilter.activeIndex === subIdx &&
          (subredditsFilter.active || !isEmpty(subredditsFilter.filterText));

        if (trigger) {
          let currentSort = sort || '';
          if (currentSort === 'top') {
            currentSort = `${currentSort}?t=${t}`;
          }
          this.subredditTarget = `${item.url}${currentSort}`;
        }

        // navigationItems.push(<div key={item.name}>{item.name}</div>);

        navigationItems.push(
          <NavigationItem
            item={item}
            key={item.name}
            lastUpdated={subLastUpdated}
            trigger={trigger}
          />
        );

        subIdx += 1;
      }
    });

    return navigationItems;
  }

  render() {
    const { subreddits } = this.props;

    let content;

    // The subreddits are eitehr loading for the first time or reloading
    if (subreddits.status === 'loading' || subreddits.status === 'unloaded') {
      content = (
        <div className="alert alert-info" id="subreddits-loading" role="alert">
          <i className="fas fa-spinner fa-spin" /> Loading Subreddits
        </div>
      );
    }

    // There was an error loading the subreddits
    if (subreddits.status === 'error') {
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
    }

    if (subreddits.status === 'loaded') {
      const navItems = this.generateNavItems(subreddits.subreddits);
      const noItems = isEmpty(navItems);

      // No subreddits are left after filtering
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
              <i className="fas fa-sync-alt" />
            </button>
          </span>
        </div>
        {content}
      </div>
    );
  }
}

NavigationSubReddits.propTypes = {
  subreddits: PropTypes.object.isRequired,
  fetchSubreddits: PropTypes.func.isRequired,
  lastUpdated: PropTypes.object.isRequired,
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
  location: PropTypes.object,
  sort: PropTypes.string.isRequired,
};

NavigationSubReddits.defaultProps = {
  location: {},
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  redditBearer: state.redditBearer,
  subreddits: state.subreddits,
  subredditsFilter: state.subredditsFilter,
  location: state.router.location,
  lastUpdated: state.lastUpdated,
});

const mapDispatchToProps = dispatch => ({
  fetchSubreddits: (reset, where) =>
    dispatch(subredditsActions.subredditsFetchData(reset, where)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationSubReddits);

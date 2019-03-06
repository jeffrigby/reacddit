import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Common from '../../common';
import NavigationGenericNavItem from './NavigationGenericNavItem';

const queryString = require('query-string');

class NavigationItem extends React.Component {
  static lastUpdatedDiff(lastUpdated) {
    const now = Math.floor(new Date().getTime() / 1000);
    return now - lastUpdated;
  }

  getDiffClassName() {
    const { lastUpdated, trigger } = this.props;
    const classes = [];
    if (lastUpdated > 0) {
      const seconds = NavigationItem.lastUpdatedDiff(lastUpdated);
      const deadSecs = (365 / 2) * 24 * 3600; // 6 months
      const staleSecs = (365 / 12) * 24 * 3600; // 3 months
      const todaySecs = 24 * 3600; // 1 day
      const newSecs = 3600 / 2; // 30 minutes

      if (seconds >= deadSecs) {
        classes.push('sub-dead');
      } else if (seconds >= staleSecs) {
        classes.push('sub-stale');
      } else if (seconds <= newSecs) {
        classes.push('sub-new');
      } else if (seconds <= todaySecs) {
        classes.push('sub-today');
      }
    }

    if (trigger) {
      classes.push('mark highlighted');
    }

    const classNameStr = classes.join(' ');
    return classNameStr;
  }

  render() {
    const { sort, location, item } = this.props;
    const query = queryString.parse(location.search);
    const { t } = query;
    let currentSort = sort || '';
    if (currentSort === 'top' || currentSort === 'controversial') {
      currentSort = `${currentSort}?t=${t}`;
    } else if (currentSort === 'relavance') {
      currentSort = '';
    }
    const href =
      item.subreddit_type === 'user'
        ? `${Common.stripTrailingSlash(item.url)}/submitted/${currentSort}`
        : `${Common.stripTrailingSlash(item.url)}/${currentSort}`;
    const classNameStr = this.getDiffClassName();
    const subLabel = classNameStr.indexOf('sub-new') !== -1 ? 'New' : null;

    return (
      <NavigationGenericNavItem
        to={href}
        text={item.display_name}
        id={item.id}
        classes={classNameStr}
        title={item.public_description}
        badge={subLabel}
      />
    );
  }
}

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  location: PropTypes.object,
  trigger: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

NavigationItem.defaultProps = {
  lastUpdated: 0,
  location: {},
};

const getLastUpdated = (lastUpdated, subreddit) => {
  if (subreddit.name === undefined) return 0;

  const subLastUpdated = lastUpdated[subreddit.name]
    ? lastUpdated[subreddit.name].lastPost
    : 0;

  return subLastUpdated;
};

const mapStateToProps = (state, ownProps) => ({
  sort: state.listingsFilter.sort,
  location: state.router.location,
  lastUpdated: getLastUpdated(state.lastUpdated, ownProps.item),
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationItem);

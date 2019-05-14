import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _trim from 'lodash/trim';
import _trimEnd from 'lodash/trimEnd';
import { distanceInWordsToNow } from 'date-fns';
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
    const { sort, location, item, lastUpdated } = this.props;
    const query = queryString.parse(location.search);
    const { t } = query;
    let currentSort = sort || '';
    switch (currentSort) {
      case 'top':
      case 'controversial':
        currentSort += `?t=${t}`;
        break;
      case 'relevance':
      case 'best':
      case 'comments':
        currentSort = '';
        break;
      default:
        break;
    }

    const href =
      item.subreddit_type === 'user'
        ? `/${_trim(item.url, '/')}/submitted/${_trim(currentSort, '/')}`
        : `/${_trim(item.url, '/')}/${_trim(currentSort, '/')}`;
    const classNameStr = this.getDiffClassName();
    const subLabel = classNameStr.indexOf('sub-new') !== -1 ? 'New' : null;

    let { title } = item;
    if (lastUpdated !== 0) {
      const timeago = distanceInWordsToNow(lastUpdated * 1000);
      title += ` - updated ${timeago} ago`;
    }

    return (
      <NavigationGenericNavItem
        to={_trimEnd(href, '/')}
        text={item.display_name}
        id={item.id}
        classes={classNameStr}
        title={title}
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

export default connect(
  mapStateToProps,
  null
)(NavigationItem);
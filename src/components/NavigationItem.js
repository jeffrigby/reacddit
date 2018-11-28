import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Common from '../common';

class NavigationItem extends React.Component {
  static lastUpdatedDiff(lastUpdated) {
    const now = Math.floor(new Date().getTime() / 1000);
    return now - lastUpdated;
  }

  getDiffClassName() {
    const { lastUpdated, trigger } = this.props;
    let classNameStr = '';
    if (lastUpdated > 0) {
      const seconds = NavigationItem.lastUpdatedDiff(lastUpdated);
      const deadSecs = (365 / 2) * 24 * 3600; // 6 months
      const staleSecs = (365 / 12) * 24 * 3600; // 3 months
      const todaySecs = 24 * 3600; // 1 day
      const newSecs = 3600 / 2; // 30 minutes

      if (seconds >= deadSecs) {
        classNameStr = 'sub-dead';
      } else if (seconds >= staleSecs) {
        classNameStr = 'sub-stale';
      } else if (seconds <= newSecs) {
        classNameStr = 'sub-new';
      } else if (seconds <= todaySecs) {
        classNameStr = 'sub-today';
      }
    }

    if (trigger) {
      classNameStr += ' mark highlighted';
    }

    return classNameStr;
  }

  render() {
    const { sort, t, item, trigger } = this.props;
    let currentSort = sort || '';
    if (currentSort === 'top' || currentSort === 'controversial') {
      currentSort = `${currentSort}?t=${t}`;
    }
    const href = `${Common.stripTrailingSlash(item.url)}/${currentSort}`;
    const classNameStr = this.getDiffClassName();
    const subLabel =
      classNameStr.indexOf('sub-new') !== -1 ? (
        <span className="label label-success">New</span>
      ) : null;
    const currentTrigger = trigger ? '>' : '';

    return (
      <li>
        <div id={item.id} className={classNameStr}>
          <NavLink
            to={href}
            title={item.public_description}
            activeClassName="activeSubreddit"
          >
            {currentTrigger} {item.display_name}
          </NavLink>{' '}
          {subLabel}
        </div>
      </li>
    );
  }
}

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  t: PropTypes.string,
  trigger: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

NavigationItem.defaultProps = {
  lastUpdated: 0,
  t: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  t: state.listingsFilter.t,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationItem);

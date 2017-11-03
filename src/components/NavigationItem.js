import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Common from '../common';

class NavigationItem extends React.Component {
  static lastUpdatedDiff(lastUpdated) {
    const now = Math.floor((new Date()).getTime() / 1000);
    return now - lastUpdated;
  }

  getDiffClassName() {
    let classNameStr = '';
    if (this.props.lastUpdated > 0) {
      const seconds = NavigationItem.lastUpdatedDiff(this.props.lastUpdated);
      const deadSecs = ((365 / 2) * 24 * 3600); // 6 months
      const staleSecs = ((365 / 12) * 24 * 3600); // 3 months
      const todaySecs = (24 * 3600); // 1 day
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

    if (this.props.trigger) {
      classNameStr += ' mark highlighted';
    }

    return classNameStr;
  }

  render() {
    let sort = this.props.sort ? this.props.sort : '';
    if (sort === 'top' || sort === 'controversial') {
      sort = `${sort}?t=${this.props.sortTop}`;
    }
    const href = `${Common.stripTrailingSlash(this.props.item.url)}/${sort}`;
    const classNameStr = this.getDiffClassName();
    const subLabel = (classNameStr.indexOf('sub-new') !== -1 ? <span className="label label-success">New</span> : null);
    const trigger = this.props.trigger ? '>' : '';

    return (
      <li>
        <div id={this.props.item.id} className={classNameStr}>
          <NavLink
            to={href}
            title={this.props.item.public_description}
            activeClassName="activeSubreddit"
          >{trigger} {this.props.item.display_name}
          </NavLink> {subLabel}
        </div>
      </li>
    );
  }
}

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  sortTop: PropTypes.string,
  trigger: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

NavigationItem.defaultProps = {
  lastUpdated: 0,
  sortTop: '',
};


const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  sortTop: state.listingsFilter.sortTop,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationItem);

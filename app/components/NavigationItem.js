import React, { PropTypes } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Common from '../common';
// import { subredditsCurrent } from '../redux/actions/subreddits';

class NavigationItem extends React.Component {
  static lastUpdatedDiff(lastUpdated) {
    const now = Math.floor((new Date()).getTime() / 1000);
    return now - lastUpdated;
  }

  getDiffClassName() {
    let classNameStr;
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

    return classNameStr;
  }

  render() {
    const sort = this.props.sort ? this.props.sort : '';
    const href = `${Common.stripTrailingSlash(this.props.item.url)}/${sort}`;
    const classNameStr = this.getDiffClassName();
    const subLabel = (classNameStr === 'sub-new' ? <span className="label label-success">New</span> : null);

    return (
      <li>
        <div id={this.props.item.id} className={classNameStr}>
          <NavLink
            to={href}
            title={this.props.item.public_description}
            activeClassName="activeSubreddit"
          >{this.props.item.display_name}</NavLink> {subLabel}
        </div>
      </li>
    );
  }
}

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  lastUpdated: PropTypes.number,
};

NavigationItem.defaultProps = {
  lastUpdated: 0,
};


const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationItem);

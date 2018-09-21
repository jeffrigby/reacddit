import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import MultiRedditsSubs from './MultiRedditsSubs';

class MultiRedditsItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSubs: false,
    };
    this.hideShowSubs = this.hideShowSubs.bind(this);
  }

  hideShowSubs() {
    const { showSubs } = this.state;
    this.setState({ showSubs: !showSubs });
  }

  render() {
    const { item, sort, sortTop } = this.props;
    const { showSubs } = this.state;

    // Generate Link
    let currentSort = sort || '';
    if (currentSort === 'top' || currentSort === 'controversial') {
      currentSort = `${currentSort}?t=${sortTop}`;
    }
    const navTo = `${item.data.path}${currentSort}`;

    // Am I active?
    // const { location } = this.props;
    // const active = navTo.indexOf(location.pathname) === 0;

    const arrowClass = showSubs ? 'up' : 'down';

    return (
      <li key={item.data.path}>
        <div>
          <button
            type="button"
            className="btn btn-link icon-right"
            onClick={this.hideShowSubs}
          >
            <span className={`glyphicon glyphicon-menu-${arrowClass}`} />
          </button>
          <NavLink
            to={navTo}
            title={item.data.description_md}
            activeClassName="activeSubreddit"
          >
            {item.data.name}
          </NavLink>
        </div>
        {showSubs && (
          <MultiRedditsSubs multiRedditSubs={item.data.subreddits} />
        )}
      </li>
    );
  }
}

MultiRedditsItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  sortTop: PropTypes.string,
  // location: PropTypes.object.isRequired,
};

MultiRedditsItem.defaultProps = {
  sortTop: '',
};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  sortTop: state.listingsFilter.sortTop,
  // location: state.router.location,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiRedditsItem);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import MultiRedditsSubs from './MultiRedditsSubs';

const queryString = require('query-string');

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
    const { item, sort, location } = this.props;
    const { showSubs } = this.state;

    const search = queryString.parse(location.search);

    // Generate Link
    let currentSort = sort || '';
    if (currentSort.match(/^(top|controversial)$/) && search.t) {
      currentSort = `${currentSort}?t=${search.t}`;
    } else if (currentSort === 'relavance') {
      currentSort = '';
    }

    const navTo = `/me/m/${item.data.name}/${currentSort}`;

    // Am I active?
    // const { location } = this.props;
    // const active = navTo.indexOf(location.pathname) === 0;

    const arrowClass = showSubs ? 'up' : 'down';

    return (
      <li key={item.data.path} className="nav-item">
        <div>
          <button
            type="button"
            className="btn btn-link icon-right"
            onClick={this.hideShowSubs}
          >
            <i className={`fas fa-caret-${arrowClass}`} />
          </button>
          <NavLink
            to={navTo}
            title={item.data.description_md}
            activeClassName="activeSubreddit"
            className="nav-link"
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
  location: PropTypes.object.isRequired,
};

MultiRedditsItem.defaultProps = {};

const mapStateToProps = state => ({
  sort: state.listingsFilter.sort,
  location: state.router.location,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiRedditsItem);

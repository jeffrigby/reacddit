import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import SubredditActions from './SubredditActions';
import Search from '../components/Search';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';
import FilterReddits from '../components/FilterReddits';
import '../styles/navbar.scss';

class Header extends React.Component {
  static showMenu() {
    jQuery('body').toggleClass('show-menu');
  }

  render() {
    const { listingsFilter } = this.props;
    const { listType, target } = listingsFilter;
    const title = target === 'mine' || !target ? '' : `: ${listType}/${target}`;

    return (
      <>
        <div className="d-flex flex-nowrap align-middle m-0 sidebar sidebar-navbar navbar-group">
          <FilterReddits />
        </div>
        <div className="d-flex flex-nowrap mx-2">
          <button
            type="button"
            className="btn btn-link menu-link"
            onClick={Header.showMenu}
          >
            <i className="fas fa-bars" />
          </button>
        </div>
        <div className="d-flex flex-nowrap mr-auto header-main">
          <span className="navbar-brand px-2">ReactReddit {title}</span>
        </div>
        <div className="d-flex flex-nowrap align-middle m-0 pr-2 header-main">
          <Search />
          <Sort />
          <SortTop />
        </div>
      </>
    );
  }
}

Header.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
};

Header.defaultProps = {};

const mapStateToProps = state => ({
  listingsFilter: state.listingsFilter,
});

const mapDispatchToProps = dispatch => ({
  // onSortTopChange: sortTop => dispatch(storeSortTop(sortTop)),
  // onSortChange: sort => dispatch(storeSort(sort))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

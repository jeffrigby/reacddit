import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Search from '../header/Search';
import Sort from '../header/Sort';
import FilterReddits from '../sidebar/FilterReddits';
import '../../styles/navbar.scss';
import ViewMode from '../header/ViewMode';

class Header extends React.Component {
  static showMenu() {
    document.body.classList.toggle('show-menu');
  }

  render() {
    const { listingsFilter } = this.props;
    const { listType, target } = listingsFilter;
    const title = target === 'mine' || !target ? '' : ` ${listType}/${target}`;

    const menuButton = (
      <button
        type="button"
        className="btn btn-link menu-link"
        onClick={Header.showMenu}
      >
        <i className="fas fa-bars" />
      </button>
    );

    const brand = (
      <>
        <span className="react">reac</span>
        <span className="reddit">ddit</span>
      </>
    );

    return (
      <>
        <div className="d-flex flex-nowrap align-middle m-0 sidebar sidebar-navbar navbar-group">
          <div className="ml-2 close-menu-link">{menuButton}</div>
          <FilterReddits />
        </div>

        <div className="d-none d-md-flex flex-nowrap header-main pr-1">
          <span className="navbar-brand px-2">
            {brand} {title}
          </span>
        </div>

        <div className="d-flex d-md-none flex-nowrap header-main small pr-1">
          <div className="px-2 open-menu-link">{menuButton}</div>
          <div className="d-block">
            <div className="w-100">{brand}</div>
            <div>{title}</div>
          </div>
        </div>

        <div className="p-2 m-auto w-100 search-cont">
          <Search />
        </div>

        <div className="d-flex flex-nowrap align-middle m-0 pr-2 header-main">
          <div className="pr-2">
            <Sort />
          </div>
          <div>
            <ViewMode />
          </div>
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

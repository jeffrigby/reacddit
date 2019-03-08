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
          <span className="navbar-brand px-2">
            <span className="react">reac</span>
            <span className="reddit">ddit</span> {title}
          </span>
        </div>
        <div className="d-flex flex-nowrap align-middle m-0 pr-2 header-main">
          <div className="pr-2">
            <Search />
          </div>
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

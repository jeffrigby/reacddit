import React from 'react';
// import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Search from '../header/Search';
import Sort from '../header/Sort';
import FilterReddits from '../sidebar/FilterReddits';
import '../../styles/navbar.scss';
import ViewMode from '../header/ViewMode';
import Logo from '../../images/reacddit-menu.png';

const Header = () => {
  const showMenu = () => {
    document.body.classList.add('show-menu');
    document.body.classList.remove('hide-menu');
  };

  const hideMenu = () => {
    document.body.classList.remove('show-menu');
    document.body.classList.add('hide-menu');
  };

  const menuButton = (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={showMenu}
    >
      <i className="fas fa-bars" />
    </button>
  );

  const closeMenuButton = (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={hideMenu}
    >
      <i className="fas fa-times" />
    </button>
  );

  const brand = (
    <NavLink to="/" className="reacddit-title">
      <img src={Logo} width={30} height={30} alt="reacddit" />
    </NavLink>
  );

  return (
    <>
      <div className="d-flex flex-nowrap align-middle m-0 sidebar sidebar-navbar navbar-group filter-cont">
        <div className="ml-2 close-menu-link">{closeMenuButton}</div>
        <FilterReddits />
      </div>

      <div className="header-brand-title pr-2 d-flex">
        <div className="px-2 open-menu-link">{menuButton}</div>
        <div className="dflex-nowrap header-main pr-0 m-0">
          <div className="navbar-brand p-0 m-0">{brand}</div>
        </div>
      </div>

      <div className="w-100 search-cont pr-2">
        <Search />
      </div>

      <div className="d-flex flex-nowrap align-middle m-0 pr-2 header-main header-actions">
        <div className="pr-2">
          <Sort />
        </div>
        <div>
          <ViewMode />
        </div>
      </div>
    </>
  );
};

Header.propTypes = {};

export default Header;

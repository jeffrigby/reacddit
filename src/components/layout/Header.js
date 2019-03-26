import React from 'react';
import PropTypes from 'prop-types';
import Search from '../header/Search';
import Sort from '../header/Sort';
import FilterReddits from '../sidebar/FilterReddits';
import '../../styles/navbar.scss';
import ViewMode from '../header/ViewMode';
// import RedditInfo from '../header/RedditInfo';
import SubUnSub from '../header/SubUnSub';
// import SubUnSub from '../header/SubUnSub';

const Header = ({ listingsFilter }) => {
  const { listType, target } = listingsFilter;
  const title = target === 'mine' || !target ? '' : ` ${listType}/${target}`;
  const showMenu = () => {
    document.body.classList.toggle('show-menu');
  };

  const menuButton = (
    <button type="button" className="btn btn-link menu-link" onClick={showMenu}>
      <i className="fas fa-bars" />
    </button>
  );

  const brand = (
    <>
      <span className="react">reac</span>
      <span className="reddit">ddit</span>
    </>
  );

  // const redditInfo = <RedditInfo />;

  return (
    <>
      <div className="d-flex flex-nowrap align-middle m-0 sidebar sidebar-navbar navbar-group">
        <div className="ml-2 close-menu-link">{menuButton}</div>
        <FilterReddits />
      </div>

      <div className="d-none d-md-flex flex-nowrap header-main pr-0">
        <div className="navbar-brand pl-2">
          {brand} {title}
        </div>
      </div>

      <div className="d-flex d-md-none flex-nowrap header-main small pr-0">
        <div className="pl-2 open-menu-link">{menuButton}</div>
        <div className="d-block px-2">
          <div className="w-100">{brand}</div>
          <div>{title}</div>
        </div>
      </div>

      <div>
        <SubUnSub />
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
};

Header.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
};

export default Header;

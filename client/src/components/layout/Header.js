import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Search from '../header/Search';
import Sort from '../header/Sort';
import Reload from '../header/Reload';
import FilterReddits from '../sidebar/FilterReddits';
import ViewMode from '../header/ViewMode';
import Logo from '../../images/reacddit-menu.png';
import Settings from '../header/settings/Settings';
import '../../styles/header.scss';
import PinMenu from '../header/settings/PinMenu';
import ToggleTheme from '../header/ToggleTheme';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      aria-label="Show Menu"
      className="btn btn-secondary btn-sm"
      type="button"
      onClick={showMenu}
    >
      <i className="fas fa-bars" />
    </button>
  );

  const closeMenuButton = (
    <button
      aria-label="Hide Menu"
      className="btn btn-secondary btn-sm"
      type="button"
      onClick={hideMenu}
    >
      <i className="fas fa-times" />
    </button>
  );

  const brand = (
    <NavLink className="reacddit-title" to="/">
      <img alt="reacddit" height={30} src={Logo} width={30} />
    </NavLink>
  );

  // removed `history.length > 2 &&` when upgrading to react-router v6
  // @todo do I need to check this?
  const backButton = location.state && location.state.showBack && (
    <div>
      <button
        aria-label="Go Back"
        className="btn btn-secondary btn-sm me-2"
        title="Go Back"
        type="button"
        onClick={() => navigate(-1)}
      >
        <i className="fas fa-chevron-left" />
      </button>
    </div>
  );

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-nowrap align-middle m-0 sidebar sidebar-navbar navbar-group filter-cont">
        <div className="ms-2 close-menu-link">{closeMenuButton}</div>
        <div className="ms-2 pin-menu-link">
          <PinMenu />
        </div>
        <FilterReddits />
      </div>

      <div className="header-brand-title pe-2 d-flex">
        <div className="px-2 open-menu-link">{menuButton}</div>
        {backButton}
        <div className="dflex-nowrap header-main pe-0 m-0">
          <div className="navbar-brand p-0 m-0">{brand}</div>
        </div>
      </div>

      <div className="w-100 search-cont">
        <Search />
      </div>

      <div className="d-flex flex-nowrap align-middle m-0 pe-2 header-main header-actions">
        <Reload />
        <Sort />
        <ViewMode />
        <ToggleTheme />
        <Settings />
      </div>
    </div>
  );
};

Header.propTypes = {};

export default Header;

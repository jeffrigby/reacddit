import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import Search from '@/components/header/Search';
import Sort from '@/components/header/Sort';
import Reload from '@/components/header/Reload';
import FilterReddits from '@/components/sidebar/FilterReddits';
import ViewMode from '@/components/header/ViewMode';
import Logo from '@/images/reacddit-menu.png';
import Settings from '@/components/header/settings/Settings';
import '@/styles/header.scss';
import PinMenu from '@/components/header/settings/PinMenu';
import ToggleTheme from '@/components/header/ToggleTheme';

function Header() {
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
    <Button
      aria-label="Show Menu"
      size="sm"
      variant="secondary"
      onClick={showMenu}
    >
      <FontAwesomeIcon icon={faBars} />
    </Button>
  );

  const closeMenuButton = (
    <Button
      aria-label="Hide Menu"
      size="sm"
      variant="secondary"
      onClick={hideMenu}
    >
      <FontAwesomeIcon icon={faTimes} />
    </Button>
  );

  const brand = (
    <NavLink className="reacddit-title" to="/">
      <img alt="reacddit" height={30} src={Logo} width={30} />
    </NavLink>
  );

  const backButton = location.state?.showBack && (
    <div>
      <Button
        aria-label="Go Back"
        className="me-2"
        size="sm"
        title="Go Back"
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </Button>
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
}

export default Header;

import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import _trimEnd from 'lodash/trimEnd';
import parse from 'url-parse';

const closeMenu = () => {
  document.body.classList.remove('show-menu');
};

const NavigationGenericNavItem = (props) => {
  const {
    to,
    text,
    title,
    isStatic,
    onClickAction,
    classes,
    id,
    badge,
    noLi,
    iconClass,
    liClass,
  } = props;
  const titleNew = title || text;
  let classNames = 'nav-link';
  if (classes) {
    classNames += ` ${classes}`;
  }

  const iconString = iconClass ? <i className={`${iconClass} fa-fw`} /> : '';

  const badgeRender = badge ? (
    <span className="badge bg-primary rounded-pill">{badge}</span>
  ) : (
    ''
  );

  const trimmedTo = _trimEnd(to, '/');
  const url = parse(trimmedTo);

  let navItem;

  if (!isStatic) {
    navItem = (
      <>
        <div className="flex-grow-1 nav-link-cont me-2">
          <NavLink
            id={id}
            to={{
              pathname: url.pathname,
              search: url.query,
              state: { showBack: true },
            }}
            title={titleNew}
            className={classNames}
            activeClassName="activeSubreddit"
            onClick={closeMenu}
          >
            {iconString} {text}
          </NavLink>
        </div>
        <div>{badgeRender}</div>
      </>
    );
  } else {
    navItem = (
      <>
        <a
          href={trimmedTo}
          title={titleNew}
          className={classNames}
          onClick={onClickAction}
        >
          {iconString} {text}
        </a>
        {badgeRender}
      </>
    );
  }

  if (noLi) {
    return navItem;
  }
  const liClassStr = `nav-item${liClass ? ` ${liClass}` : ''}`;
  return <li className={liClassStr}>{navItem}</li>;
};

NavigationGenericNavItem.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
  classes: PropTypes.string,
  id: PropTypes.string,
  badge: PropTypes.string,
  iconClass: PropTypes.string,
  liClass: PropTypes.string,
  isStatic: PropTypes.bool,
  noLi: PropTypes.bool,
  onClickAction: PropTypes.func,
};

NavigationGenericNavItem.defaultProps = {
  title: null,
  onClickAction: null,
  isStatic: false,
  noLi: false,
  classes: '',
  id: '',
  badge: '',
  iconClass: '',
  liClass: '',
};

export default NavigationGenericNavItem;

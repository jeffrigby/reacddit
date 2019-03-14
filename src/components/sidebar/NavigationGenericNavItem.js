import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const closeMenu = () => {
  document.body.classList.remove('show-menu');
};

const NavigationGenericNavItem = props => {
  const {
    to,
    text,
    title,
    key,
    isStatic,
    onClickAction,
    classes,
    id,
    badge,
    noLi,
    iconClass,
  } = props;
  const titleNew = title || text;
  const keyNew = key || to;
  const itemKey = `navLink-${keyNew}`;
  let classNames = 'nav-link';
  if (classes) {
    classNames += ` ${classes}`;
  }

  const iconString = iconClass ? <i className={`${iconClass} fa-fw`} /> : '';

  const badgeRender = badge ? (
    <span className="badge badge-primary badge-pill">{badge}</span>
  ) : (
    ''
  );

  let navItem;

  if (!isStatic) {
    navItem = (
      <>
        <NavLink
          id={id}
          to={to}
          title={titleNew}
          className={classNames}
          activeClassName="activeSubreddit"
          data-toggle="tooltip"
          data-placement="right"
          onClick={closeMenu}
        >
          {iconString} {text}
        </NavLink>
        {badgeRender}{' '}
      </>
    );
  } else {
    navItem = (
      <>
        <a
          href={to}
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
  return (
    <li key={itemKey} className="nav-item">
      {navItem}
    </li>
  );
};

NavigationGenericNavItem.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
  classes: PropTypes.string,
  id: PropTypes.string,
  badge: PropTypes.string,
  key: PropTypes.string,
  iconClass: PropTypes.string,
  isStatic: PropTypes.bool,
  noLi: PropTypes.bool,
  onClickAction: PropTypes.func,
};

NavigationGenericNavItem.defaultProps = {
  title: null,
  key: null,
  onClickAction: null,
  isStatic: false,
  noLi: false,
  classes: '',
  id: '',
  badge: '',
  iconClass: '',
};

export default NavigationGenericNavItem;

import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import _trimEnd from 'lodash/trimEnd';
import parse from 'url-parse';

const closeMenu = () => {
  document.body.classList.remove('show-menu');
};

function NavigationGenericNavItem({
  to,
  text,
  title = null,
  isStatic = false,
  onClickAction = null,
  classes = '',
  id = '',
  badge = '',
  noLi = false,
  iconClass = '',
  liClass = '',
}) {
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
            className={classNames}
            id={id}
            title={titleNew}
            to={{
              pathname: url.pathname,
              search: url.query,
              state: { showBack: true },
            }}
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
          className={classNames}
          href={trimmedTo}
          title={titleNew}
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
}

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

export default NavigationGenericNavItem;

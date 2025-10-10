import type { ReactElement, MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import _trimEnd from 'lodash/trimEnd';
import parse from 'url-parse';

interface NavigationGenericNavItemProps {
  to: string;
  text: string;
  title?: string;
  isStatic?: boolean;
  onClickAction?: ((e: MouseEvent<HTMLAnchorElement>) => void) | null;
  classes?: string;
  id?: string;
  badge?: string;
  noLi?: boolean;
  iconClass?: string;
  liClass?: string;
}

function closeMenu(): void {
  document.body.classList.remove('show-menu');
}

function NavigationGenericNavItem({
  to,
  text,
  title,
  isStatic = false,
  onClickAction = null,
  classes = '',
  id = '',
  badge = '',
  noLi = false,
  iconClass = '',
  liClass = '',
}: NavigationGenericNavItemProps): ReactElement {
  const titleNew = title ?? text;
  const linkClassNames = `nav-link${classes ? ` ${classes}` : ''}`;

  const iconElement = iconClass ? (
    <i className={`${iconClass} fa-fw`} />
  ) : null;

  const badgeElement = badge ? (
    <span className="badge bg-primary rounded-pill">{badge}</span>
  ) : null;

  const trimmedTo = _trimEnd(to, '/');
  const url = parse(trimmedTo);

  let navItem: ReactElement;

  if (!isStatic) {
    navItem = (
      <>
        <div className="flex-grow-1 nav-link-cont me-2">
          <NavLink
            className={linkClassNames}
            id={id}
            state={{ showBack: true }}
            title={titleNew}
            to={{
              pathname: url.pathname,
              search: url.query,
            }}
            onClick={closeMenu}
          >
            {iconElement} {text}
          </NavLink>
        </div>
        <div>{badgeElement}</div>
      </>
    );
  } else {
    navItem = (
      <>
        <a
          className={linkClassNames}
          href={trimmedTo}
          title={titleNew}
          onClick={onClickAction ?? undefined}
        >
          {iconElement} {text}
        </a>
        {badgeElement}
      </>
    );
  }

  if (noLi) {
    return navItem;
  }
  const liClassStr = liClass ? `nav-item ${liClass}` : 'nav-item';
  return <li className={liClassStr}>{navItem}</li>;
}

export default NavigationGenericNavItem;

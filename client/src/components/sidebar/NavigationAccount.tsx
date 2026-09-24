import { memo, useEffect, useState, useRef } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faInfoCircle,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { setMenuStatus, getMenuStatus, hotkeyStatus } from '@/common';
import { ACCOUNT_LINKS } from './accountLinks';
import Friends from './Friends';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import 'react-tooltip/dist/react-tooltip.css';

const menuID = 'navAccount';
const tooltipID = 'nav-user-info';

function NavigationAccount(): ReactElement | null {
  const me = useAppSelector((state) => state.redditMe?.me);
  const navigate = useNavigate();

  const [showNavAccountMenu, setShowNavAccountMenu] = useState<boolean>(() =>
    getMenuStatus(menuID, true)
  );

  const lastKeyPressed = useRef<string>('');

  useEffect(() => {
    function hotkeys(event: KeyboardEvent): void {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        if (lastKeyPressed.current === 'g' && me?.name) {
          if (pressedKey === 'f') {
            navigate('/r/friends');
          } else {
            const link = ACCOUNT_LINKS.find((l) => l.hotkey === pressedKey);
            if (link) {
              navigate(`/user/${me.name}/${link.target}`);
            }
          }
        }

        lastKeyPressed.current = pressedKey;
      }
    }

    document.addEventListener('keydown', hotkeys);
    return () => document.removeEventListener('keydown', hotkeys);
  }, [me?.name, navigate]);

  function toggleShowMenu(): void {
    setShowNavAccountMenu(!showNavAccountMenu);
    setMenuStatus(menuID, !showNavAccountMenu);
  }

  if (!me?.name) {
    return null;
  }

  const caretIcon = showNavAccountMenu ? faCaretDown : faCaretRight;

  const karmaTotal = (me.link_karma ?? 0) + (me.comment_karma ?? 0);
  const joinedDate = formatDistanceToNow((me.created_utc ?? 0) * 1000);

  return (
    <>
      <div id="sidebar-nav_account">
        <div className="sidebar-heading d-flex text-muted show-cursor">
          <span className="me-1" role="presentation" onClick={toggleShowMenu}>
            <FontAwesomeIcon className="menu-caret" icon={caretIcon} />{' '}
            {me.name}
          </span>
          <span>
            <FontAwesomeIcon data-tooltip-id={tooltipID} icon={faInfoCircle} />
          </span>
          <span className="ms-auto">
            <NavigationGenericNavItem
              isStatic
              noLi
              classes="m-0 p-0"
              icon={faSignOutAlt}
              text=""
              title="Logout"
              to={`${import.meta.env.VITE_API_PATH}/logout`}
            />
          </span>
        </div>
        {showNavAccountMenu && (
          <ul className="nav flex-column">
            <Friends />
            {ACCOUNT_LINKS.map((link) => (
              <NavigationGenericNavItem
                icon={link.icon}
                key={link.target}
                text={link.text}
                title={link.title}
                to={`/user/${me.name}/${link.target}`}
              />
            ))}
          </ul>
        )}
      </div>
      <Tooltip id={tooltipID} place="bottom">
        <div>{karmaTotal.toLocaleString()} Karma</div>
        <div>{(me.link_karma ?? 0).toLocaleString()} Post Karma</div>
        <div>{(me.comment_karma ?? 0).toLocaleString()} Comment Karma</div>
        <div>Joined {joinedDate} ago</div>
      </Tooltip>
    </>
  );
}

export default memo(NavigationAccount);

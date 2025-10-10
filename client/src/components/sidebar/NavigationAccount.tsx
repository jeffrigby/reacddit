import { memo, useEffect, useState, useRef } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import { useAppSelector } from '@/redux/hooks';
import Friends from './Friends';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { setMenuStatus, getMenuStatus, hotkeyStatus } from '../../common';
import 'react-tooltip/dist/react-tooltip.css';

const menuID = 'navAccount';

function NavigationAccount(): ReactElement {
  const me = useAppSelector((state) => state.redditMe?.me);
  const navigate = useNavigate();

  const [showNavAccountMenu, toggleShowNavAccountMenu] = useState<boolean>(
    getMenuStatus(menuID, true)
  );

  const lastKeyPressed = useRef<string>('');

  useEffect(() => {
    function hotkeys(event: KeyboardEvent): void {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        // Navigation key commands
        if (lastKeyPressed.current === 'g') {
          // Logged in only
          if (me?.name) {
            const { name } = me;
            switch (pressedKey) {
              case 'f':
                navigate('/r/friends');
                break;
              case 'u':
                navigate(`/user/${name}/upvoted`);
                break;
              case 'd':
                navigate(`/user/${name}/downvoted`);
                break;
              case 'b':
                navigate(`/user/${name}/posts`);
                break;
              case 's':
                navigate(`/user/${name}/saved`);
                break;
              default:
                break;
            }
          }
        }

        lastKeyPressed.current = pressedKey;
      }
    }

    document.addEventListener('keydown', hotkeys);
    return () => document.removeEventListener('keydown', hotkeys);
    // Only depend on me?.name, not full me object to avoid unnecessary reruns
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.name, navigate]);

  function toggleShowMenu(): void {
    toggleShowNavAccountMenu(!showNavAccountMenu);
    setMenuStatus(menuID, !showNavAccountMenu);
  }

  if (!me?.name) {
    return null;
  }

  const caretClass = showNavAccountMenu
    ? 'fas fa-caret-down menu-caret'
    : 'fas fa-caret-right menu-caret';

  const karmaTotal = (me.link_karma || 0) + (me.comment_karma || 0);
  const joinedDate = formatDistanceToNow((me.created_utc || 0) * 1000);
  const accountInfo = `
      ${karmaTotal.toLocaleString()} Karma
      <br />
      ${(me.link_karma || 0).toLocaleString()} Post Karma
      <br />
      ${(me.comment_karma || 0).toLocaleString()} Comment Karma
      <br />
      Joined ${joinedDate} ago
  `;

  return (
    <>
      <div id="sidebar-nav_account">
        <div className="sidebar-heading d-flex text-muted show-cursor">
          <span className="me-1" role="presentation" onClick={toggleShowMenu}>
            <i className={caretClass} /> {me.name}
          </span>
          <span>
            <i
              className="fas fa-info-circle"
              data-tooltip-html={accountInfo}
              id="nav-user-info"
            />
          </span>
          <span className="ms-auto">
            <NavigationGenericNavItem
              isStatic
              noLi
              classes="m-0 p-0"
              iconClass="fas fa-sign-out-alt m-0 p-0"
              text=""
              title="Logout"
              to={`${process.env.API_PATH}/logout`}
            />
          </span>
        </div>
        {showNavAccountMenu && (
          <ul className="nav flex-column">
            <Friends />
            <NavigationGenericNavItem
              iconClass="far fa-file"
              text="Posts"
              title="Show My Submitted Posts"
              to={`/user/${me.name}/posts`}
            />
            <NavigationGenericNavItem
              iconClass="far fa-thumbs-up"
              text="Upvoted"
              title="Show My Upvoted Posts"
              to={`/user/${me.name}/upvoted`}
            />
            <NavigationGenericNavItem
              iconClass="far fa-thumbs-down"
              text="Downvoted"
              title="Show My Downvoted Posts"
              to={`/user/${me.name}/downvoted`}
            />
            <NavigationGenericNavItem
              iconClass="far fa-bookmark"
              text="Saved"
              title="Show My Saved Posts"
              to={`/user/${me.name}/saved`}
            />
          </ul>
        )}
      </div>
      <Tooltip html anchorId="nav-user-info" place="bottom" />
    </>
  );
}

export default memo(NavigationAccount);

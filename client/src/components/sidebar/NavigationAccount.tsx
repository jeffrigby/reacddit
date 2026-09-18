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
import {
  faBookmark,
  faComments,
  faEyeSlash,
  faFile,
  faStar,
  faThumbsDown,
  faThumbsUp,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { setMenuStatus, getMenuStatus, hotkeyStatus } from '@/common';
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
        if (lastKeyPressed.current === 'g') {
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
              case 'c':
                navigate(`/user/${name}/comments`);
                break;
              case 'v':
                navigate(`/user/${name}/overview`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
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
            <NavigationGenericNavItem
              icon={faUser}
              text="Overview"
              title="Show My Posts and Comments"
              to={`/user/${me.name}/overview`}
            />
            <NavigationGenericNavItem
              icon={faFile}
              text="Posts"
              title="Show My Submitted Posts"
              to={`/user/${me.name}/posts`}
            />
            <NavigationGenericNavItem
              icon={faComments}
              text="Comments"
              title="Show My Comments"
              to={`/user/${me.name}/comments`}
            />
            <NavigationGenericNavItem
              icon={faThumbsUp}
              text="Upvoted"
              title="Show My Upvoted Posts"
              to={`/user/${me.name}/upvoted`}
            />
            <NavigationGenericNavItem
              icon={faThumbsDown}
              text="Downvoted"
              title="Show My Downvoted Posts"
              to={`/user/${me.name}/downvoted`}
            />
            <NavigationGenericNavItem
              icon={faBookmark}
              text="Saved"
              title="Show My Saved Posts"
              to={`/user/${me.name}/saved`}
            />
            <NavigationGenericNavItem
              icon={faEyeSlash}
              text="Hidden"
              title="Show My Hidden Posts"
              to={`/user/${me.name}/hidden`}
            />
            <NavigationGenericNavItem
              icon={faStar}
              text="Gilded"
              title="Show My Gilded Posts and Comments"
              to={`/user/${me.name}/gilded`}
            />
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

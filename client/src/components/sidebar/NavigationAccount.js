import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import Friends from './Friends';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { setMenuStatus, getMenuStatus, hotkeyStatus } from '../../common';
import 'react-tooltip/dist/react-tooltip.css';

const menuID = 'navAccount';

function NavigationAccount() {
  const me = useSelector((state) => state.redditMe.me);
  const navigate = useNavigate();

  const urlPush = (url) => navigate(url);

  const [showNavAccountMenu, toggleShowNavAccountMenu] = useState(
    getMenuStatus(menuID, true)
  );

  let lastKeyPressed = '';
  const hotkeys = (event) => {
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      // Navigation key commands
      if (lastKeyPressed === 'g') {
        // Logged in only
        if (me.name) {
          const { name } = me;
          switch (pressedKey) {
            case 'f':
              urlPush('/r/friends');
              break;
            case 'u':
              urlPush(`/user/${name}/upvoted`);
              break;
            case 'd':
              urlPush(`/user/${name}/downvoted`);
              break;
            case 'b':
              urlPush(`/user/${name}/posts`);
              break;
            case 's':
              urlPush(`/user/${name}/saved`);
              break;
            default:
              break;
          }
        }
      }

      lastKeyPressed = pressedKey;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => document.removeEventListener('keydown', hotkeys);
  });

  const toggleShowMenu = () => {
    toggleShowNavAccountMenu(!showNavAccountMenu);
    setMenuStatus(menuID, !showNavAccountMenu);
  };

  const caretClass = showNavAccountMenu
    ? 'fas fa-caret-down menu-caret'
    : 'fas fa-caret-right menu-caret';

  const karmaTotal = me.link_karma + me.comment_karma;
  const joinedDate = formatDistanceToNow(me.created_utc * 1000);
  const accountInfo = `
      ${karmaTotal.toLocaleString()} Karma
      <br />
      ${me.link_karma.toLocaleString()} Post Karma
      <br />
      ${me.comment_karma.toLocaleString()} Comment Karma
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
      <Tooltip html anchorId="nav-user-info" effect="solid" place="bottom" />
    </>
  );
}

export default memo(NavigationAccount);

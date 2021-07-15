import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { formatDistanceToNow } from 'date-fns';
import Friends from './Friends';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { setMenuStatus, getMenuStatus, hotkeyStatus } from '../../common';

const menuID = 'navAccount';

const NavigationAccount = () => {
  const me = useSelector((state) => state.redditMe.me);
  const dispatch = useDispatch();

  const urlPush = (url) => dispatch(push(url));

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
    <div id="sidebar-nav_account">
      <div className="sidebar-heading d-flex text-muted show-cursor">
        <span className="me-1" onClick={toggleShowMenu} role="presentation">
          <i className={caretClass} /> {me.name}
        </span>
        <span>
          <i
            className="fas fa-info-circle"
            data-tip={accountInfo}
            id="nav-user-info"
          />
        </span>
        <span className="ms-auto">
          <NavigationGenericNavItem
            to={`${process.env.API_PATH}/logout`}
            text=""
            title="Logout"
            isStatic
            noLi
            iconClass="fas fa-sign-out-alt m-0 p-0"
            classes="m-0 p-0"
          />
        </span>
      </div>
      {showNavAccountMenu && (
        <ul className="nav flex-column">
          <Friends />
          <NavigationGenericNavItem
            to={`/user/${me.name}/posts`}
            text="Posts"
            title="Show My Submitted Posts"
            iconClass="far fa-file"
          />
          <NavigationGenericNavItem
            to={`/user/${me.name}/upvoted`}
            text="Upvoted"
            title="Show My Upvoted Posts"
            iconClass="far fa-thumbs-up"
          />
          <NavigationGenericNavItem
            to={`/user/${me.name}/downvoted`}
            text="Downvoted"
            title="Show My Downvoted Posts"
            iconClass="far fa-thumbs-down"
          />
          <NavigationGenericNavItem
            to={`/user/${me.name}/saved`}
            text="Saved"
            title="Show My Saved Posts"
            iconClass="far fa-bookmark"
          />
        </ul>
      )}
    </div>
  );
};

export default memo(NavigationAccount);

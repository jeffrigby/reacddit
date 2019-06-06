import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Friends from './Friends';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { menus } from '../../redux/actions/misc';

const { API_PATH } = process.env;

const NavigationAccount = ({
  me,
  disableHotkeys,
  urlPush,
  showMenu,
  setMenuSettings,
}) => {
  let lastKeyPressed = '';
  const [showNavAccountMenu, toggleShowNavAccountMenu] = useState(showMenu);

  const hotkeys = event => {
    const pressedKey = event.key;

    if (!disableHotkeys) {
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
              urlPush(`/user/${name}/submitted`);
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
    return () => {
      return document.removeEventListener('keydown', hotkeys);
    };
  });

  const toggleShowMenu = () => {
    toggleShowNavAccountMenu(!showMenu);
    setMenuSettings({ navigationAccount: !showMenu });
  };

  const caretClass = showNavAccountMenu
    ? 'fas fa-caret-down menu-caret mr-1'
    : 'fas fa-caret-right menu-caret mr-1';

  return (
    <div id="sidebar-multis">
      <div
        className="sidebar-heading d-flex text-muted"
        onClick={toggleShowMenu}
        role="presentation"
      >
        <span>
          <i className={caretClass} />
        </span>{' '}
        <span>{me.name}</span>
      </div>
      {showNavAccountMenu && (
        <ul className="nav flex-column">
          <Friends />
          <NavigationGenericNavItem
            to={`/user/${me.name}/submitted`}
            text="Submitted"
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
          <NavigationGenericNavItem
            to={`${API_PATH}/logout`}
            text="Logout"
            title="Logout"
            isStatic
            iconClass="fas fa-sign-out-alt"
          />
        </ul>
      )}
    </div>
  );
};

NavigationAccount.propTypes = {
  me: PropTypes.object.isRequired,
  disableHotkeys: PropTypes.bool.isRequired,
  urlPush: PropTypes.func.isRequired,
  showMenu: PropTypes.bool,
  setMenuSettings: PropTypes.func.isRequired,
};

NavigationAccount.defaultProps = {
  showMenu: true,
};

const mapStateToProps = state => ({
  me: state.redditMe.me,
  disableHotkeys: state.disableHotKeys,
  showMenu: state.menus.navigationAccount,
});

export default connect(
  mapStateToProps,
  { urlPush: push, setMenuSettings: menus }
)(React.memo(NavigationAccount));

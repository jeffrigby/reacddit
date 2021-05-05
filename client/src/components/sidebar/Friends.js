import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { redditFetchFriends } from '../../redux/actions/reddit';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import RedditAPI from '../../reddit/redditAPI';
import { setMenuStatus, getMenuStatus } from '../../common';
import { getDiffClassName } from './navHelpers';

const Friends = () => {
  const menuID = 'friends';
  const [showFriends, toggleShowFriends] = useState(getMenuStatus(menuID));
  const lastUpdated = useSelector((state) => state.lastUpdated);
  const redditFriends = useSelector((state) => state.redditFriends);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showFriends) {
      // Get a fresh listing.
      dispatch(redditFetchFriends(true));
    } else {
      // Get from the cache. This is mostly to support
      // Marking friends in post listing.
      dispatch(redditFetchFriends());
    }
  }, [dispatch, showFriends]);

  const removeFriend = async (id) => {
    await RedditAPI.removeFriend(id);
    dispatch(redditFetchFriends(true));
  };

  if (redditFriends.status === 'unloaded') return null;

  const { friends } = redditFriends;

  if (!Object.keys(friends).length) {
    return null;
  }

  const navItems = [];
  Object.values(friends).forEach((f) => {
    const link = `/user/${f.name}/posts?sort=new`;
    const friendLastUpdated = lastUpdated[f.id]
      ? lastUpdated[f.id].lastPost
      : 0;

    let title = `${f.name} Posts`;

    const classNameStr = getDiffClassName(friendLastUpdated, false);
    const badge = classNameStr.indexOf('sub-new') !== -1 ? 'New' : null;

    if (friendLastUpdated !== 0) {
      const timeago = formatDistanceToNow(friendLastUpdated * 1000);
      title += ` - updated ${timeago} ago`;
    }

    navItems.push(
      <React.Fragment key={f.id}>
        <li className="nav-item d-flex friend-li">
          <div className="mr-auto d-flex w-100">
            <NavigationGenericNavItem
              to={link}
              text={f.name}
              id={f.id}
              classes={classNameStr}
              title={title}
              badge={badge}
              noLi
            />
          </div>
          <div className="friend-actions">
            <button
              className="btn-link"
              type="button"
              onClick={() =>
                // eslint-disable-next-line
                window.confirm(`Remove ${f.name} from friends?`) &&
                removeFriend(f.name)
              }
              title={`Remove ${f.name} from friend's list`}
            >
              <i className="fas fa-user-minus" />
            </button>
          </div>
        </li>
      </React.Fragment>
    );
  });

  const caretClass = showFriends
    ? 'fas fa-caret-down menu-caret'
    : 'fas fa-caret-left menu-caret';

  const toggleMenu = () => {
    toggleShowFriends(!showFriends);
    setMenuStatus(menuID, !showFriends);
  };

  return (
    <>
      <li className="nav-item">
        <div className="d-flex">
          <div className="mr-auto">
            <NavigationGenericNavItem
              to="/r/friends"
              text="Friends"
              title="Show Friend's Posts"
              iconClass="fas fa-user-friends"
              noLi
            />
          </div>
          <div>
            <button
              className="btn btn-link btn-sm m-0 p-0 border-0"
              type="button"
              onClick={toggleMenu}
            >
              <i className={caretClass} />
            </button>
          </div>
        </div>
      </li>
      {showFriends && (
        <li className="friends">
          <ul className="nav subnav pl-2">{navItems}</ul>
        </li>
      )}
    </>
  );
};

Friends.propTypes = {};
Friends.defaultProps = {};

export default Friends;

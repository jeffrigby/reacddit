import React, { useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { produce } from 'immer';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import RedditAPI from '../../reddit/redditAPI';
import { setMenuStatus, getMenuStatus } from '../../common';
import { getDiffClassName } from './navHelpers';
import { subredditsData } from '../../redux/actions/subreddits';

// Constants
const MENU_ID = 'friends';
const INVALID_STATUSES = ['loading', 'unloaded', 'error'];

// Custom hook for friends logic
function useFriends() {
  const [showFriends, setShowFriends] = useState(getMenuStatus(MENU_ID));
  const lastUpdated = useSelector((state) => state.lastUpdated);
  const subreddits = useSelector((state) => state.subreddits);
  const dispatch = useDispatch();

  const toggleShowFriends = useCallback(() => {
    const newShowFriends = !showFriends;
    setShowFriends(newShowFriends);
    setMenuStatus(MENU_ID, newShowFriends);
  }, [showFriends]);

  const unfollowUser = useCallback(
    async (name) => {
      const nameLower = name.toLowerCase();
      try {
        await RedditAPI.followUser(nameLower, 'unsub');
        const newSubreddits = produce(subreddits, (draft) => {
          delete draft.subreddits[nameLower];
        });
        dispatch(subredditsData(newSubreddits));
      } catch (error) {
        // eslint-disable-next-line
        console.error(`Error unfollowing user ${name}:`, error);
      }
    },
    [subreddits, dispatch]
  );

  return {
    showFriends,
    toggleShowFriends,
    lastUpdated,
    subreddits,
    unfollowUser,
  };
}

function Friends() {
  const {
    showFriends,
    toggleShowFriends,
    lastUpdated,
    subreddits,
    unfollowUser,
  } = useFriends();

  const friendItems = useMemo(() => {
    if (INVALID_STATUSES.includes(subreddits.status)) {
      return null;
    }

    return Object.values(subreddits.subreddits)
      .filter((item) => item.subreddit_type === 'user')
      .map(({ url, id, display_name: displayName, title }) => {
        const link = `${url}posts?sort=new`;
        const friendLastUpdated = lastUpdated[`t5_${id}`]?.lastPost || 0;
        const classNameStr = getDiffClassName(friendLastUpdated, false);
        const badge = classNameStr.includes('sub-new') ? 'New' : null;
        const cleanDisplayName = displayName.replace('u_', '');
        const timeago =
          friendLastUpdated !== 0
            ? formatDistanceToNow(friendLastUpdated * 1000)
            : '';

        return (
          <li key={id} className="nav-item d-flex friend-li">
            <div className="me-auto d-flex w-100">
              <NavigationGenericNavItem
                to={link}
                text={cleanDisplayName}
                id={id}
                classes={classNameStr}
                title={`${cleanDisplayName} Posts${timeago ? ` - updated ${timeago} ago` : ''}`}
                badge={badge}
                noLi
              />
            </div>
            <div className="friend-actions">
              <button
                className="btn-link"
                type="button"
                onClick={() => {
                  if (
                    // eslint-disable-next-line
                    window.confirm(`Remove ${cleanDisplayName} from friends?`)
                  ) {
                    unfollowUser(displayName);
                  }
                }}
                title={`Remove ${displayName} from friend's list`}
                aria-label={`Remove ${displayName} from friend's list`}
              >
                <i className="fas fa-user-minus" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      });
  }, [subreddits, lastUpdated, unfollowUser]);

  if (!friendItems || friendItems.length === 0) {
    return null;
  }

  return (
    <>
      <li className="nav-item">
        <div className="d-flex">
          <div className="me-auto">
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
              onClick={toggleShowFriends}
              aria-label={showFriends ? 'Hide Friends' : 'Show Friends'}
            >
              <i
                className={`fas fa-caret-${showFriends ? 'down' : 'left'} menu-caret`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </li>
      {showFriends && (
        <li className="friends">
          <ul className="nav subnav ps-2">{friendItems}</ul>
        </li>
      )}
    </>
  );
}

export default React.memo(Friends);

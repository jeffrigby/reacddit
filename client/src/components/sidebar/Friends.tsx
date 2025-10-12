import { useMemo, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { produce } from 'immer';
import RedditAPI from '@/reddit/redditAPI';
import { setMenuStatus, getMenuStatus } from '@/common';
import { subredditsData } from '@/redux/actions/subreddits';
import type { AppDispatch } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import { getDiffClassName } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';

// Constants
const MENU_ID = 'friends';
const INVALID_STATUSES = new Set(['loading', 'unloaded', 'error']);

// Custom hook for friends logic
function useFriends() {
  const [showFriends, setShowFriends] = useState(getMenuStatus(MENU_ID));
  const lastUpdated = useAppSelector((state) => state.lastUpdated);
  const subreddits = useAppSelector((state) => state.subreddits);
  const dispatch = useDispatch<AppDispatch>();

  const toggleShowFriends = useCallback(() => {
    const newShowFriends = !showFriends;
    setShowFriends(newShowFriends);
    setMenuStatus(MENU_ID, newShowFriends);
  }, [showFriends]);

  const unfollowUser = useCallback(
    async (name: string) => {
      const nameLower = name.toLowerCase();
      try {
        await RedditAPI.followUser(nameLower, 'unsub');
        const newSubreddits = produce(subreddits, (draft) => {
          delete draft.subreddits[nameLower];
        });
        dispatch(subredditsData(newSubreddits));
      } catch (error) {
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
    if (INVALID_STATUSES.has(subreddits.status)) {
      return null;
    }

    return Object.values(subreddits.subreddits)
      .filter((item) => item.subreddit_type === 'user')
      .map(({ url, id, display_name: displayName, title }) => {
        const link = `${url}posts?sort=new`;
        const friendLastUpdated = lastUpdated[`t5_${id}`]?.lastPost ?? 0;
        const classNameStr = getDiffClassName(friendLastUpdated, false);
        const badge = classNameStr.includes('sub-new') ? 'New' : null;
        const cleanDisplayName = displayName.replace('u_', '');
        const timeago =
          friendLastUpdated !== 0
            ? formatDistanceToNow(friendLastUpdated * 1000)
            : '';

        return (
          <li className="nav-item d-flex friend-li" key={id}>
            <div className="me-auto d-flex w-100">
              <NavigationGenericNavItem
                noLi
                badge={badge}
                classes={classNameStr}
                id={id}
                text={cleanDisplayName}
                title={`${cleanDisplayName} Posts${timeago ? ` - updated ${timeago} ago` : ''}`}
                to={link}
              />
            </div>
            <div className="friend-actions">
              <button
                aria-label={`Remove ${displayName} from friend's list`}
                className="btn-link"
                title={`Remove ${displayName} from friend's list`}
                type="button"
                onClick={() => {
                  if (
                    window.confirm(`Remove ${cleanDisplayName} from friends?`)
                  ) {
                    unfollowUser(displayName);
                  }
                }}
              >
                <i aria-hidden="true" className="fas fa-user-minus" />
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
              noLi
              iconClass="fas fa-user-friends"
              text="Friends"
              title="Show Friend's Posts"
              to="/r/friends"
            />
          </div>
          <div>
            <Button
              aria-label={showFriends ? 'Hide Friends' : 'Show Friends'}
              className="m-0 p-0 border-0"
              size="sm"
              variant="link"
              onClick={toggleShowFriends}
            >
              <i
                aria-hidden="true"
                className={`fas fa-caret-${showFriends ? 'down' : 'left'} menu-caret`}
              />
            </Button>
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

export default Friends;

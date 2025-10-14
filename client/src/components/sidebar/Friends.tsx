import { useMemo, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserFriends,
  faUserMinus,
  faCaretDown,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { followUser } from '@/reddit/redditApiTs';
import { setMenuStatus, getMenuStatus } from '@/common';
import {
  selectAllSubreddits,
  selectSubredditsStatus,
  selectLastUpdatedTracking,
  fetchSubreddits,
} from '@/redux/slices/subredditsSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getDiffClassName } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';

// Constants
const MENU_ID = 'friends';
const INVALID_STATUSES = new Set(['loading', 'idle', 'failed']);

// Custom hook for friends logic
function useFriends() {
  const [showFriends, setShowFriends] = useState(getMenuStatus(MENU_ID));
  const lastUpdated = useAppSelector(selectLastUpdatedTracking);
  const allSubreddits = useAppSelector(selectAllSubreddits);
  const subredditsStatus = useAppSelector(selectSubredditsStatus);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const dispatch = useAppDispatch();

  const toggleShowFriends = useCallback(() => {
    const newShowFriends = !showFriends;
    setShowFriends(newShowFriends);
    setMenuStatus(MENU_ID, newShowFriends);
  }, [showFriends]);

  const unfollowUser = useCallback(
    async (name: string) => {
      const nameLower = name.toLowerCase();
      try {
        await followUser(nameLower, 'unsub');
        // Refetch subreddits after unfollowing (cache will be updated)
        const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
        dispatch(fetchSubreddits({ reset: true, where }));
      } catch (error) {
        console.error(`Error unfollowing user ${name}:`, error);
      }
    },
    [redditBearer.status, dispatch]
  );

  return {
    showFriends,
    toggleShowFriends,
    lastUpdated,
    allSubreddits,
    subredditsStatus,
    unfollowUser,
  };
}

function Friends() {
  const {
    showFriends,
    toggleShowFriends,
    lastUpdated,
    allSubreddits,
    subredditsStatus,
    unfollowUser,
  } = useFriends();

  const friendItems = useMemo(() => {
    if (INVALID_STATUSES.has(subredditsStatus)) {
      return null;
    }

    const userSubreddits = allSubreddits.filter(
      (item) => item.subreddit_type === 'user'
    );

    return userSubreddits.map(({ url, id, display_name: displayName }) => {
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
              badge={badge ?? undefined}
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
              <FontAwesomeIcon aria-hidden="true" icon={faUserMinus} />
            </button>
          </div>
        </li>
      );
    });
  }, [allSubreddits, subredditsStatus, lastUpdated, unfollowUser]);

  if (!friendItems || friendItems.length === 0) {
    return null;
  }

  const caretIcon = showFriends ? faCaretDown : faCaretLeft;

  return (
    <>
      <li className="nav-item">
        <div className="d-flex">
          <div className="me-auto">
            <NavigationGenericNavItem
              noLi
              icon={faUserFriends}
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
              <FontAwesomeIcon
                aria-hidden="true"
                className="menu-caret"
                icon={caretIcon}
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

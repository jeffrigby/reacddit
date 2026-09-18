import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useSubscribeToSubredditMutation } from '@/redux/api';

interface PostBylineFollowProps {
  author: string;
  /** The author's profile subreddit, u_<name> in lowercase */
  authorSub: string;
  isFollowed: boolean;
}

/**
 * Follow and unfollow button for an author. Following is a subscription to
 * the profile subreddit; the icon flips at once and holds until the
 * subscribed list has refetched.
 */
function PostBylineFollow({
  author,
  authorSub,
  isFollowed,
}: PostBylineFollowProps): React.JSX.Element {
  const [subscribeToSubreddit] = useSubscribeToSubredditMutation();
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null);

  const displayFollowing = optimisticFollowing ?? isFollowed;

  // Keep the optimistic value until the server state catches up — clearing it
  // when the mutation resolves would revert the button to the stale cache
  // value while the invalidation refetch is still in flight.
  useEffect(() => {
    if (optimisticFollowing !== null && optimisticFollowing === isFollowed) {
      setOptimisticFollowing(null);
    }
  }, [optimisticFollowing, isFollowed]);

  const onClick = async (): Promise<void> => {
    const follow = !displayFollowing;
    setOptimisticFollowing(follow);
    try {
      await subscribeToSubreddit({
        name: authorSub,
        action: follow ? 'sub' : 'unsub',
        type: 'sr_name',
      }).unwrap();
    } catch (error) {
      console.error(`Failed to ${follow ? 'follow' : 'unfollow'} user:`, error);
      setOptimisticFollowing(null);
    }
  };

  const title = displayFollowing ? `unfollow ${author}` : `follow ${author}`;

  return (
    <Button
      aria-label={title}
      className="shadow-none me-1"
      size="sm"
      title={title}
      variant="link"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={displayFollowing ? faUserMinus : faUserPlus} />
    </Button>
  );
}

export default PostBylineFollow;

import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useSubscribeToSubredditMutation } from '@/redux/api';

interface PostBylineFollowProps {
  author: string;
  /** The author's profile subreddit, u_<name> in lowercase */
  authorSub: string;
  following: boolean;
  /** Receives the intended state at once, and null if the request fails */
  onOptimistic: (following: boolean | null) => void;
}

/**
 * Follow and unfollow button for an author. Following is a subscription to
 * the profile subreddit.
 */
function PostBylineFollow({
  author,
  authorSub,
  following,
  onOptimistic,
}: PostBylineFollowProps): React.JSX.Element {
  const [subscribeToSubreddit] = useSubscribeToSubredditMutation();

  const onClick = async (): Promise<void> => {
    const follow = !following;
    onOptimistic(follow);
    try {
      await subscribeToSubreddit({
        name: authorSub,
        action: follow ? 'sub' : 'unsub',
        type: 'sr_name',
      }).unwrap();
    } catch (error) {
      console.error(`Failed to ${follow ? 'follow' : 'unfollow'} user:`, error);
      onOptimistic(null);
    }
  };

  const title = following ? `unfollow ${author}` : `follow ${author}`;

  return (
    <Button
      aria-label={title}
      className="shadow-none me-1"
      size="sm"
      title={title}
      variant="link"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={following ? faUserMinus : faUserPlus} />
    </Button>
  );
}

export default PostBylineFollow;

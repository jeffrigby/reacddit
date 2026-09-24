import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import { selectIsAuth } from '@/redux/slices/redditBearerSlice';
import { useSubscribeToSubredditMutation } from '@/redux/api';
import type { SubredditData } from '@/types/redditApi';

interface SubUnSubProps {
  about: SubredditData | Record<string, never> | null;
}

/**
 * Subscribe and unsubscribe button for the listing header. The subscribe
 * mutation patches the cached about entry, so the button reads its state
 * from there alone.
 * @param about - Subreddit about data passed from parent
 * @returns Rendered button, or null when there is nothing to act on
 */
function SubUnSub({ about }: SubUnSubProps) {
  const { target, listType } = useParams();
  const auth = useAppSelector(selectIsAuth);
  const [subscribeToSubreddit, { isLoading }] =
    useSubscribeToSubredditMutation();

  const {
    name,
    display_name: displayName,
    display_name_prefixed: displayNamePrefixed,
    user_is_subscriber: subscribed,
  } = about ?? {};

  const buttonAction = useCallback(async () => {
    if (!name) {
      return;
    }
    try {
      await subscribeToSubreddit({
        name, // Fullname, e.g. t5_2qt55
        action: subscribed ? 'unsub' : 'sub',
        type: 'sr',
        displayName,
      }).unwrap();
    } catch (error) {
      console.error('Subscribe/unsubscribe failed:', error);
    }
  }, [name, displayName, subscribed, subscribeToSubreddit]);

  if (!name || !auth || (target === 'popular' && listType === 'r')) {
    return null;
  }

  const text = subscribed ? 'Unsubscribe' : 'Subscribe';
  const title = `${text} ${subscribed ? 'From' : 'To'} ${displayNamePrefixed}`;

  return (
    <Button
      className="sub-un-sub"
      disabled={isLoading}
      size="sm"
      title={title}
      variant="primary"
      onClick={buttonAction}
    >
      <FontAwesomeIcon icon={subscribed ? faMinusCircle : faPlusCircle} />{' '}
      {text}
    </Button>
  );
}

export default SubUnSub;

import { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import { useSubscribeToSubredditMutation } from '@/redux/api';
import type { SubredditData } from '@/types/redditApi';

interface SubUnSubProps {
  about: SubredditData | Record<string, never> | null;
}

/**
 * Subscribe and unsubscribe button for the listing header. The parent keys
 * it by subreddit, so its state never outlives the subreddit it was set for.
 * @param about - Subreddit about data passed from parent
 * @returns Rendered button, or null when there is nothing to act on
 */
function SubUnSub({ about }: SubUnSubProps) {
  const { target, listType } = useParams();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const [subscribeToSubreddit, { isLoading }] =
    useSubscribeToSubredditMutation();

  const {
    name,
    display_name: displayName,
    display_name_prefixed: displayNamePrefixed,
    user_is_subscriber: userIsSubscriber,
  } = about ?? {};

  // The intended state shows at once and holds until the about entry has
  // refetched; clearing it when the request resolves would show the stale
  // cache value while the refetch is still in flight.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const subscribed = optimistic ?? userIsSubscriber;

  useEffect(() => {
    if (optimistic !== null && optimistic === userIsSubscriber) {
      setOptimistic(null);
    }
  }, [optimistic, userIsSubscriber]);

  const buttonAction = useCallback(async () => {
    if (!name) {
      return;
    }
    const next = !subscribed;
    setOptimistic(next);
    try {
      await subscribeToSubreddit({
        name, // Fullname, e.g. t5_2qt55
        action: next ? 'sub' : 'unsub',
        type: 'sr',
        displayName,
      }).unwrap();
    } catch (error) {
      console.error('Subscribe/unsubscribe failed:', error);
      setOptimistic(null);
    }
  }, [name, displayName, subscribed, subscribeToSubreddit]);

  if (
    !name ||
    redditBearer.status !== 'auth' ||
    (target === 'popular' && listType === 'r')
  ) {
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

import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import {
  useSubscribeToSubredditMutation,
  useGetSubredditsQuery,
  subredditSelectors,
} from '@/redux/api';

/**
 * SubscribeButton component to handle subscribing and unsubscribing from subreddits
 * Uses RTK Query mutation with automatic cache invalidation and optimistic UI updates
 * @returns Rendered SubscribeButton component or null if conditions not met
 */
function SubUnSub() {
  const params = useParams();

  const redditBearer = useAppSelector((state) => state.redditBearer);
  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  const { target, listType } = params;

  // Use RTK Query to get cached subreddit data
  const { about } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data }) => ({
        about:
          data && target
            ? subredditSelectors.selectById(data, target.toLowerCase())
            : null,
      }),
    }
  );

  // Local state for optimistic UI updates
  const [optimisticSubscribed, setOptimisticSubscribed] = useState<
    boolean | null
  >(null);

  // RTK Query mutation hook
  const [subscribeToSubreddit, { isLoading }] =
    useSubscribeToSubredditMutation();

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about ?? {};

  // Use optimistic state if set, otherwise use server state
  const effectiveSubscribed = optimisticSubscribed ?? userIsSubscriber;

  const buttonAction = useCallback(async () => {
    if (!about) {
      return;
    }

    const newSubscribedState = !effectiveSubscribed;

    // Optimistically update UI immediately
    setOptimisticSubscribed(newSubscribedState);

    try {
      await subscribeToSubreddit({
        name: about.name, // This is the fullname (e.g., "t5_2qt55")
        action: newSubscribedState ? 'sub' : 'unsub',
        type: 'sr', // Use 'sr' for fullname, not 'sr_name'
      }).unwrap();
    } catch (error) {
      console.error('Subscribe/unsubscribe failed:', error);
      // Revert optimistic update on error
      setOptimisticSubscribed(null);
    }
  }, [effectiveSubscribed, about, subscribeToSubreddit]);

  if (
    !about ||
    redditBearer.status !== 'auth' ||
    (target === 'popular' && listType === 'r')
  ) {
    return null;
  }

  const subIcon = effectiveSubscribed ? faMinusCircle : faPlusCircle;
  const text = effectiveSubscribed ? 'Unsubscribe' : 'Subscribe';

  const title = `${
    effectiveSubscribed ? `${text} From` : `${text} To`
  } ${displayNamePrefixed}`;

  return (
    <Button
      className="sub-un-sub"
      disabled={isLoading}
      size="sm"
      title={title}
      variant="primary"
      onClick={buttonAction}
    >
      <FontAwesomeIcon icon={subIcon} /> {text}
    </Button>
  );
}

export default SubUnSub;

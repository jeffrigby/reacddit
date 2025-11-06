import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useSubscribeToSubredditMutation } from '@/redux/api';
import { selectSubredditData } from '@/redux/slices/listingsSlice';
import { fetchSubreddits } from '@/redux/slices/subredditsSlice';

/**
 * SubscribeButton component to handle subscribing and unsubscribing from subreddits
 * Uses RTK Query mutation with automatic cache invalidation and optimistic UI updates
 * @returns Rendered SubscribeButton component or null if conditions not met
 */
function SubUnSub() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const params = useParams();

  const about = useAppSelector((state) =>
    selectSubredditData(state, location.key)
  );
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const { status: bearerStatus } = redditBearer;

  // Local state for optimistic UI updates
  const [optimisticSubscribed, setOptimisticSubscribed] = useState<
    boolean | null
  >(null);

  // RTK Query mutation hook
  const [subscribeToSubreddit, { isLoading }] =
    useSubscribeToSubredditMutation();

  const { target, listType } = params;

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about;

  // Use optimistic state if set, otherwise use server state
  const effectiveSubscribed = optimisticSubscribed ?? userIsSubscriber;

  const buttonAction = useCallback(async () => {
    const newSubscribedState = !effectiveSubscribed;

    // Optimistically update UI immediately
    setOptimisticSubscribed(newSubscribedState);

    try {
      await subscribeToSubreddit({
        name: about.name, // This is the fullname (e.g., "t5_2qt55")
        action: newSubscribedState ? 'sub' : 'unsub',
        type: 'sr', // Use 'sr' for fullname, not 'sr_name'
      }).unwrap();

      // TODO: Remove this manual dispatch when subreddit query is migrated to RTK Query
      // For now, subreddit list still uses old Redux slice, so we need to manually refetch
      const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
      dispatch(fetchSubreddits({ reset: true, where }));
    } catch (error) {
      console.error('Subscribe/unsubscribe failed:', error);
      // Revert optimistic update on error
      setOptimisticSubscribed(null);
    }
  }, [
    effectiveSubscribed,
    about.name,
    subscribeToSubreddit,
    redditBearer.status,
    dispatch,
  ]);

  if (
    isEmpty(about) ||
    bearerStatus !== 'auth' ||
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

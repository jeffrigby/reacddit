import { useCallback, useState } from 'react';
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
 * SubscribeButton component to handle subscribing and unsubscribing from subreddits
 * Uses RTK Query mutation with automatic cache invalidation and optimistic UI updates
 * @param about - Subreddit about data passed from parent
 * @returns Rendered SubscribeButton component or null if conditions not met
 */
function SubUnSub({ about }: SubUnSubProps) {
  const params = useParams();

  const redditBearer = useAppSelector((state) => state.redditBearer);

  const { target, listType } = params;

  // Optimistic state, tied to the subreddit it was set for so it cannot
  // carry over when the header moves to another subreddit.
  const [optimistic, setOptimistic] = useState<{
    name: string;
    subscribed: boolean;
  } | null>(null);

  // RTK Query mutation hook
  const [subscribeToSubreddit, { isLoading }] =
    useSubscribeToSubredditMutation();

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about ?? {};

  const aboutName = about && 'name' in about ? about.name : undefined;
  const optimisticSubscribed =
    optimistic !== null && optimistic.name === aboutName
      ? optimistic.subscribed
      : null;
  // Use optimistic state if set, otherwise use server state
  const effectiveSubscribed = optimisticSubscribed ?? userIsSubscriber;

  const buttonAction = useCallback(async () => {
    if (!about || !('name' in about)) {
      return;
    }

    const newSubscribedState = !effectiveSubscribed;

    // Optimistically update UI immediately
    setOptimistic({ name: about.name, subscribed: newSubscribedState });

    try {
      await subscribeToSubreddit({
        name: about.name, // This is the fullname (e.g., "t5_2qt55")
        action: newSubscribedState ? 'sub' : 'unsub',
        type: 'sr', // Use 'sr' for fullname, not 'sr_name'
      }).unwrap();
    } catch (error) {
      console.error('Subscribe/unsubscribe failed:', error);
      // Revert optimistic update on error
      setOptimistic(null);
    }
  }, [effectiveSubscribed, about, subscribeToSubreddit]);

  // Check if about is valid (not null, not empty object)
  const hasAboutData =
    about && 'name' in about && 'display_name_prefixed' in about;

  if (
    !hasAboutData ||
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

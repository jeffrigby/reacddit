import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { SubredditData } from '@/types/redditApi';
import type { RootState } from '@/types/redux';
import { fetchSubreddits } from '@/redux/slices/subredditsSlice';
import { currentSubreddit } from '../../redux/actions/listings';
import RedditAPI from '../../reddit/redditAPI';

// Helper selector for getting current subreddit from currentSubreddit state
const getCurrentSubreddit = (state: RootState, locationKey: string) => {
  const key = locationKey ?? 'front';
  return state.currentSubreddit[key] ?? {};
};

/**
 * Custom hook to handle subreddit subscription
 * @returns Callback function to subscribe to a subreddit
 */
function useSubscribe() {
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  return useCallback(
    async (about: SubredditData, locationKey: string) => {
      await RedditAPI.subscribe(about.name, 'sub');
      const newAbout = { ...about, user_is_subscriber: true };
      dispatch(currentSubreddit(locationKey, newAbout));
      // Refetch subreddits to update cache
      const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
      dispatch(fetchSubreddits({ reset: true, where }));
    },
    [dispatch, redditBearer.status]
  );
}

/**
 * Custom hook to handle subreddit unsubscription
 * @returns Callback function to unsubscribe from a subreddit
 */
function useUnsubscribe() {
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  return useCallback(
    async (about: SubredditData, locationKey: string) => {
      await RedditAPI.subscribe(about.name, 'unsub');
      const newAbout = { ...about, user_is_subscriber: false };
      dispatch(currentSubreddit(locationKey, newAbout));
      // Refetch subreddits to update cache
      const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
      dispatch(fetchSubreddits({ reset: true, where }));
    },
    [dispatch, redditBearer.status]
  );
}

/**
 * SubscribeButton component to handle subscribing and unsubscribing from subreddits
 * @returns Rendered SubscribeButton component or null if conditions not met
 */
function SubUnSub() {
  const location = useLocation();
  const params = useParams();

  const about = useAppSelector((state) =>
    getCurrentSubreddit(state, location.key)
  );
  const { status: bearerStatus } = useAppSelector(
    (state) => state.redditBearer
  );

  const subscribe = useSubscribe();
  const unsubscribe = useUnsubscribe();

  const locationKey = location.key || 'front';
  const { target, listType } = params;

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about;

  const buttonAction = useCallback(
    () =>
      userIsSubscriber
        ? unsubscribe(about, locationKey)
        : subscribe(about, locationKey),
    [userIsSubscriber, unsubscribe, about, locationKey, subscribe]
  );

  if (
    isEmpty(about) ||
    bearerStatus !== 'auth' ||
    (target === 'popular' && listType === 'r')
  ) {
    return null;
  }

  const subIcon = userIsSubscriber ? faMinusCircle : faPlusCircle;
  const text = userIsSubscriber ? 'Unsubscribe' : 'Subscribe';

  const title = `${
    userIsSubscriber ? `${text} From` : `${text} To`
  } ${displayNamePrefixed}`;

  return (
    <Button
      className="sub-un-sub"
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

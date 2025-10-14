import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { SubredditData } from '@/types/redditApi';
import { fetchSubreddits } from '@/redux/slices/subredditsSlice';
import { selectSubredditData } from '@/redux/slices/listingsSlice';
import { subscribe as subscribeApi } from '@/reddit/redditApiTs';

/**
 * Custom hook to handle subreddit subscription
 * @returns Callback function to subscribe to a subreddit
 */
function useSubscribe() {
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  return useCallback(
    async (about: SubredditData) => {
      await subscribeApi(about.name, 'sub');
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
    async (about: SubredditData) => {
      await subscribeApi(about.name, 'unsub');
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
    selectSubredditData(state, location.key)
  );
  const { status: bearerStatus } = useAppSelector(
    (state) => state.redditBearer
  );

  const subscribe = useSubscribe();
  const unsubscribe = useUnsubscribe();

  const { target, listType } = params;

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about;

  const buttonAction = useCallback(
    () => (userIsSubscriber ? unsubscribe(about) : subscribe(about)),
    [userIsSubscriber, unsubscribe, about, subscribe]
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

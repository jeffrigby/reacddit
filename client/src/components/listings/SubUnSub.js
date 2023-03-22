import { useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
import produce from 'immer';
import { subredditsData } from '../../redux/actions/subreddits';
import { currentSubreddit } from '../../redux/actions/listings';
import RedditAPI from '../../reddit/redditAPI';
import { getCurrentSubreddit } from '../../redux/selectors/subredditSelectors';

/**
 * Custom hook to handle subreddit subscription
 * @returns {Function} - Callback function to subscribe to a subreddit
 */
function useSubscribe() {
  const dispatch = useDispatch();
  return useCallback(
    async (about, subreddits, locationKey) => {
      await RedditAPI.subscribe(about.name, 'sub');
      const newAbout = { ...about, user_is_subscriber: true };
      dispatch(currentSubreddit(locationKey, newAbout));
      const newSubreddits = produce(subreddits, (draft) => {
        draft.subreddits[about.display_name] = newAbout;
      });
      dispatch(subredditsData(newSubreddits));
    },
    [dispatch]
  );
}

/**
 * Custom hook to handle subreddit unsubscription
 * @returns {Function} - Callback function to unsubscribe from a subreddit
 */
function useUnsubscribe() {
  const dispatch = useDispatch();
  return useCallback(
    async (about, subreddits, locationKey) => {
      await RedditAPI.subscribe(about.name, 'unsub');
      const newAbout = { ...about, user_is_subscriber: false };
      dispatch(currentSubreddit(locationKey, newAbout));
      const newSubreddits = produce(subreddits, (draft) => {
        delete draft.subreddits[about.display_name];
      });
      dispatch(subredditsData(newSubreddits));
    },
    [dispatch]
  );
}

/**
 * SubscribeButton component to handle subscribing and unsubscribing from subreddits
 * @returns {JSX.Element|null} - Rendered SubscribeButton component or null if conditions not met
 */
function SubUnSub() {
  const location = useLocation();
  const params = useParams();

  const about = useSelector((state) =>
    getCurrentSubreddit(state, location.key)
  );
  const subreddits = useSelector((state) => state.subreddits);
  const { status: bearerStatus } = useSelector((state) => state.redditBearer);

  const subscribe = useSubscribe();
  const unsubscribe = useUnsubscribe();

  const {
    user_is_subscriber: userIsSubscriber,
    display_name_prefixed: displayNamePrefixed,
  } = about;
  const locationKey = location.key || 'front';
  const { target, listType } = params;

  const buttonAction = useCallback(
    () =>
      userIsSubscriber
        ? unsubscribe(about, subreddits, locationKey)
        : subscribe(about, subreddits, locationKey),
    [about, subreddits, unsubscribe, subscribe, locationKey]
  );

  if (
    isEmpty(about) ||
    bearerStatus !== 'auth' ||
    (target === 'popular' && listType === 'r')
  ) {
    return null;
  }

  const iconClass = `fas ${
    userIsSubscriber ? 'fa-minus-circle' : 'fa-plus-circle'
  }`;

  const text = userIsSubscriber ? 'Unsubscribe' : 'Subscribe';

  const title = `${
    userIsSubscriber ? `${text} From` : `${text} To`
  } ${displayNamePrefixed}`;

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm sub-un-sub"
      title={title}
      onClick={buttonAction}
    >
      <i className={iconClass} /> {text}
    </button>
  );
}

export default SubUnSub;

import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
import produce from 'immer';
import { subredditsData } from '../../redux/actions/subreddits';
import { currentSubreddit } from '../../redux/actions/listings';
import RedditAPI from '../../reddit/redditAPI';
import { getCurrentSubreddit } from '../../redux/selectors/subredditSelectors';

const SubUnSub = () => {
  const location = useLocation();
  const params = useParams();
  const locationKey = location.key || 'front';

  const about = useSelector((state) => getCurrentSubreddit(state));
  const subreddits = useSelector((state) => state.subreddits);
  const redditBearer = useSelector((state) => state.redditBearer);

  const dispatch = useDispatch();

  if (
    isEmpty(about) ||
    redditBearer.status !== 'auth' ||
    (params.target === 'popular' && params.listType === 'r')
  ) {
    return null;
  }

  const unsubAction = async () => {
    await RedditAPI.subscribe(about.name, 'unsub');
    const newAbout = { ...about, user_is_subscriber: false };
    dispatch(currentSubreddit(locationKey, newAbout));

    const newSubreddits = produce(subreddits, (draft) => {
      delete draft.subreddits[about.display_name];
    });
    dispatch(subredditsData(newSubreddits));
  };

  const subAction = async () => {
    await RedditAPI.subscribe(about.name, 'sub');
    const newAbout = { ...about, user_is_subscriber: true };
    dispatch(currentSubreddit(locationKey, newAbout));
    const newSubreddits = produce(subreddits, (draft) => {
      draft.subreddits[about.display_name] = newAbout;
    });
    dispatch(subredditsData(newSubreddits));
  };

  const buttonAction = about.user_is_subscriber ? unsubAction : subAction;

  const iconClass = `fas ${
    about.user_is_subscriber ? 'fa-minus-circle' : 'fa-plus-circle'
  }`;

  const text = about.user_is_subscriber ? 'Unsubscribe' : 'Subscribe';

  const title = `${about.user_is_subscriber ? `${text} From` : `${text} To`} ${
    about.display_name_prefixed
  }`;

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
};

export default SubUnSub;

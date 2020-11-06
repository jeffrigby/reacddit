import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import produce from 'immer';
import { subredditsData } from '../../redux/actions/subreddits';
import { currentSubreddit } from '../../redux/actions/listings';
import RedditAPI from '../../reddit/redditAPI';
import { getCurrentSubreddit } from '../../redux/selectors/subredditSelectors';

const SubUnSub = ({
  about,
  setCurrentSubreddit,
  subreddits,
  setSubreddits,
  redditBearer,
}) => {
  const location = useLocation();
  const locationKey = location.key || 'front';

  if (isEmpty(about) || redditBearer.status !== 'auth') {
    return null;
  }

  const unsubAction = async () => {
    await RedditAPI.subscribe(about.name, 'unsub');
    const newAbout = { ...about, user_is_subscriber: false };
    setCurrentSubreddit(locationKey, newAbout);
    const newSubreddits = produce(subreddits, (draft) => {
      delete draft.subreddits[about.display_name];
    });
    setSubreddits(newSubreddits);
  };

  const subAction = async () => {
    await RedditAPI.subscribe(about.name, 'sub');
    const newAbout = { ...about, user_is_subscriber: true };
    setCurrentSubreddit(locationKey, newAbout);
    const newSubreddits = produce(subreddits, (draft) => {
      draft.subreddits[about.display_name] = newAbout;
    });
    setSubreddits(newSubreddits);
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

SubUnSub.propTypes = {
  about: PropTypes.object,
  setCurrentSubreddit: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  setSubreddits: PropTypes.func.isRequired,
  redditBearer: PropTypes.object.isRequired,
};

SubUnSub.defaultProps = {
  about: {},
};

const mapStateToProps = (state) => ({
  about: getCurrentSubreddit(state),
  subreddits: state.subreddits,
  redditBearer: state.redditBearer,
});

export default connect(mapStateToProps, {
  setCurrentSubreddit: currentSubreddit,
  setSubreddits: subredditsData,
})(SubUnSub);

import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import {
  subredditsFetchData,
  subredditsFetchDataSuccess,
} from '../../redux/actions/subreddits';
import { currentSubreddit } from '../../redux/actions/listings';
import RedditAPI from '../../reddit/redditAPI';

const SubUnSub = ({
  about,
  fetchSubreddits,
  setCurrentSubreddit,
  subreddits,
  setSubreddits,
  redditBearer,
}) => {
  if (isEmpty(about) || redditBearer.status !== 'auth') {
    return null;
  }

  const unsubAction = async () => {
    await RedditAPI.subscribe(about.name, 'unsub');
    const newAbout = { ...about, user_is_subscriber: false };
    setCurrentSubreddit(newAbout);
    const newSubreddits = { ...subreddits };
    delete newSubreddits.subreddits[about.display_name];
    setSubreddits(newSubreddits);
  };

  const subAction = async () => {
    await RedditAPI.subscribe(about.name, 'sub');
    const newAbout = { ...about, user_is_subscriber: true };
    setCurrentSubreddit(newAbout);
    const newSubreddits = { ...subreddits };
    newSubreddits.subreddits[about.display_name] = newAbout;
    setSubreddits(newSubreddits);
  };

  const buttonAction = about.user_is_subscriber ? unsubAction : subAction;

  const iconClass = `fas ${
    about.user_is_subscriber ? 'fa-minus-circle' : 'fa-plus-circle'
  }`;
  const title = `${
    about.user_is_subscriber ? 'Unsubscribe From' : 'Subscribe To'
  } ${about.display_name_prefixed}`;

  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      title={title}
      onClick={buttonAction}
    >
      <i className={iconClass} />
    </button>
  );
};

SubUnSub.propTypes = {
  about: PropTypes.object,
  fetchSubreddits: PropTypes.func.isRequired,
  setCurrentSubreddit: PropTypes.func.isRequired,
  subreddits: PropTypes.object.isRequired,
  setSubreddits: PropTypes.func.isRequired,
  redditBearer: PropTypes.object.isRequired,
};

SubUnSub.defaultProps = {
  about: {},
};

const mapStateToProps = state => ({
  about: state.currentSubreddit,
  subreddits: state.subreddits,
  redditBearer: state.redditBearer,
});

export default connect(
  mapStateToProps,
  {
    fetchSubreddits: subredditsFetchData,
    setCurrentSubreddit: currentSubreddit,
    setSubreddits: subredditsFetchDataSuccess,
  }
)(SubUnSub);

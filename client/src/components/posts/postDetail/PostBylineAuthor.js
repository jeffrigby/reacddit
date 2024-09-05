import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { produce } from 'immer';
import classNames from 'classnames';

import RedditAPI from '../../../reddit/redditAPI';
import { subredditsData } from '../../../redux/actions/subreddits';

/**
 * Renders the author information and actions for a post.
 *
 * @param {string} author - The username of the post author.
 * @param {string|null} flair - The flair for the post author. Defaults to null.
 * @param {boolean} isSubmitter - Specifies if the author is also the submitter of the post. Defaults to false.
 *
 * @returns {JSX.Element} - The rendered author information and actions.
 */
function PostBylineAuthor({ author, flair = null, isSubmitter = false }) {
  const dispatch = useDispatch();
  const subreddits = useSelector((state) => state.subreddits);

  const authorSub = useMemo(() => `u_${author.toLowerCase()}`, [author]);
  const isFollowed = useMemo(
    () =>
      !!(
        subreddits &&
        subreddits.subreddits &&
        subreddits.subreddits[authorSub]
      ),
    [subreddits, authorSub]
  );

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed);
  }, [isFollowed]);

  const unfollowUser = async (name) => {
    await RedditAPI.followUser(name, 'unsub');
    setIsFollowing(false);
    const newSubreddits = produce(subreddits, (draft) => {
      delete draft.subreddits[authorSub];
    });
    dispatch(subredditsData(newSubreddits));
  };

  const followUser = async (name) => {
    await RedditAPI.followUser(name, 'sub');
    setIsFollowing(true);
    const subredditAbout = await RedditAPI.subredditAbout(authorSub);
    const newSubreddits = produce(subreddits, (draft) => {
      draft.subreddits[authorSub] = subredditAbout.data;
    });
    dispatch(subredditsData(newSubreddits));
  };

  const onClick = () =>
    isFollowing ? unfollowUser(authorSub) : followUser(authorSub);
  const title = !isFollowing ? `follow ${author}` : `unfollow ${author}`;

  const authorFlair = flair ? (
    <span className="badge bg-dark">{flair}</span>
  ) : null;

  const authorClasses = classNames({
    'is-followed': isFollowing,
    'is-submitter': isSubmitter,
  });

  return author === '[deleted]' ? (
    <div>
      <i className="fas fa-user" /> {author}
    </div>
  ) : (
    <>
      <button
        className="btn btn-link btn-sm shadow-none"
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
      >
        <i
          className={`fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'}`}
        />
      </button>{' '}
      <Link
        to={{
          pathname: `/user/${author}/posts/new`,
          state: { showBack: true },
        }}
        className={authorClasses}
      >
        {author}
      </Link>{' '}
      {authorFlair}
    </>
  );
}

PostBylineAuthor.propTypes = {
  author: PropTypes.string.isRequired,
  flair: PropTypes.string,
  isSubmitter: PropTypes.bool,
};

export default PostBylineAuthor;

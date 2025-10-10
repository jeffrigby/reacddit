import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { produce } from 'immer';
import classNames from 'classnames';
import RedditAPI from '../../../reddit/redditAPI';
import { subredditsData } from '../../../redux/actions/subreddits';
import { useAppSelector } from '../../../redux/hooks';

interface PostBylineAuthorProps {
  author: string;
  flair?: string | null;
  isSubmitter?: boolean;
}

/**
 * Renders the author information and actions for a post.
 *
 * @param author - The username of the post author.
 * @param flair - The flair for the post author. Defaults to null.
 * @param isSubmitter - Specifies if the author is also the submitter of the post. Defaults to false.
 *
 * @returns The rendered author information and actions.
 */
function PostBylineAuthor({
  author,
  flair = null,
  isSubmitter = false,
}: PostBylineAuthorProps): React.JSX.Element {
  const dispatch = useDispatch();
  const subreddits = useAppSelector((state) => state.subreddits);

  const authorSub = useMemo(() => `u_${author.toLowerCase()}`, [author]);
  const isFollowed = useMemo(
    () => !!subreddits?.subreddits?.[authorSub],
    [subreddits, authorSub]
  );

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed);
  }, [isFollowed]);

  const unfollowUser = async (name: string): Promise<void> => {
    try {
      await RedditAPI.followUser(name, 'unsub');
      const newSubreddits = produce(subreddits, (draft) => {
        delete draft.subreddits[authorSub];
      });
      dispatch(subredditsData(newSubreddits));
      setIsFollowing(false);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      setIsFollowing(true); // Revert optimistic update
    }
  };

  const followUser = async (name: string): Promise<void> => {
    try {
      await RedditAPI.followUser(name, 'sub');
      const subredditAbout = await RedditAPI.subredditAbout(authorSub);
      const newSubreddits = produce(subreddits, (draft) => {
        draft.subreddits[authorSub] = subredditAbout.data;
      });
      dispatch(subredditsData(newSubreddits));
      setIsFollowing(true);
    } catch (error) {
      console.error('Failed to follow user:', error);
      setIsFollowing(false); // Revert optimistic update
    }
  };

  const onClick = (): void => {
    if (isFollowing) {
      unfollowUser(authorSub);
    } else {
      followUser(authorSub);
    }
  };

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
        aria-label={title}
        className="btn btn-link btn-sm shadow-none"
        title={title}
        type="button"
        onClick={onClick}
      >
        <i
          className={`fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'}`}
        />
      </button>{' '}
      <Link
        className={authorClasses}
        state={{ showBack: true }}
        to={`/user/${author}/posts/new`}
      >
        {author}
      </Link>{' '}
      {authorFlair}
    </>
  );
}

export default PostBylineAuthor;

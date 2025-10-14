import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserMinus,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import RedditAPI from '../../../reddit/redditAPI';
import {
  fetchSubreddits,
  selectSubredditById,
} from '../../../redux/slices/subredditsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

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
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);

  const authorSub = useMemo(() => `u_${author.toLowerCase()}`, [author]);
  const followedUser = useAppSelector((state) =>
    selectSubredditById(state, authorSub)
  );
  const isFollowed = useMemo(() => !!followedUser, [followedUser]);

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed);
  }, [isFollowed]);

  const unfollowUser = async (name: string): Promise<void> => {
    try {
      setIsFollowing(false); // Optimistic update
      await RedditAPI.followUser(name, 'unsub');
      // Refetch subreddits to update cache
      const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
      dispatch(fetchSubreddits({ reset: true, where }));
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      setIsFollowing(true); // Revert optimistic update
    }
  };

  const followUser = async (name: string): Promise<void> => {
    try {
      setIsFollowing(true); // Optimistic update
      await RedditAPI.followUser(name, 'sub');
      // Refetch subreddits to update cache
      const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
      dispatch(fetchSubreddits({ reset: true, where }));
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
      <FontAwesomeIcon icon={faUser} /> {author}
    </div>
  ) : (
    <>
      <Button
        aria-label={title}
        className="shadow-none"
        size="sm"
        title={title}
        variant="link"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={isFollowing ? faUserMinus : faUserPlus} />
      </Button>{' '}
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

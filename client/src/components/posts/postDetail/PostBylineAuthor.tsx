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
import {
  useGetSubredditsQuery,
  subredditSelectors,
  useSubscribeToSubredditMutation,
} from '@/redux/api';
import { useAppSelector } from '@/redux/hooks';

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
  const redditBearer = useAppSelector((state) => state.redditBearer);

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
  const authorSub = useMemo(() => `u_${author.toLowerCase()}`, [author]);

  // Use RTK Query mutation for subscribing/unsubscribing
  const [subscribeToSubreddit] = useSubscribeToSubredditMutation();

  // Use RTK Query hook with selectFromResult to check if user is followed
  const { followedUser } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data }) => ({
        followedUser: data
          ? subredditSelectors.selectById(data, authorSub)
          : undefined,
      }),
    }
  );

  const isFollowed = useMemo(() => !!followedUser, [followedUser]);

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed);
  }, [isFollowed]);

  const unfollowUser = async (name: string): Promise<void> => {
    try {
      setIsFollowing(false); // Optimistic update
      await subscribeToSubreddit({
        name,
        action: 'unsub',
        type: 'sr_name',
      }).unwrap();
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      setIsFollowing(true); // Revert optimistic update
    }
  };

  const followUser = async (name: string): Promise<void> => {
    try {
      setIsFollowing(true); // Optimistic update
      await subscribeToSubreddit({
        name,
        action: 'sub',
        type: 'sr_name',
      }).unwrap();
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

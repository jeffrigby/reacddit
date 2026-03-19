import { useMemo, useOptimistic, startTransition } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
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

  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    isFollowed,
    (_, newFollowing: boolean) => newFollowing
  );

  const unfollowUser = async (name: string): Promise<void> => {
    startTransition(() => {
      setOptimisticFollowing(false);
    });
    try {
      await subscribeToSubreddit({
        name,
        action: 'unsub',
        type: 'sr_name',
      }).unwrap();
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const followUser = async (name: string): Promise<void> => {
    startTransition(() => {
      setOptimisticFollowing(true);
    });
    try {
      await subscribeToSubreddit({
        name,
        action: 'sub',
        type: 'sr_name',
      }).unwrap();
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const onClick = (): void => {
    if (optimisticFollowing) {
      unfollowUser(authorSub);
    } else {
      followUser(authorSub);
    }
  };

  const title = !optimisticFollowing
    ? `follow ${author}`
    : `unfollow ${author}`;

  const authorFlair = flair ? (
    <span className="badge bg-dark">{flair}</span>
  ) : null;

  const authorClasses = clsx({
    'is-followed': optimisticFollowing,
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
        <FontAwesomeIcon
          icon={optimisticFollowing ? faUserMinus : faUserPlus}
        />
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

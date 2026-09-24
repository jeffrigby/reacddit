import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useGetSubredditsQuery, subredditSelectors } from '@/redux/api';
import { useAppSelector } from '@/redux/hooks';
import { selectIsAuth } from '@/redux/slices/redditBearerSlice';
import { selectUsername } from '@/redux/slices/redditMeSlice';
import PostBylineFollow from './PostBylineFollow';

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
  const authorSub = useMemo(() => `u_${author.toLowerCase()}`, [author]);

  // Following needs an account, and an account cannot follow itself.
  const canFollow = useAppSelector(
    (state) =>
      selectIsAuth(state) &&
      selectUsername(state)?.toLowerCase() !== author.toLowerCase()
  );

  const { isFollowed } = useGetSubredditsQuery(
    { where: 'subscriber' },
    {
      skip: !canFollow,
      selectFromResult: ({ data }) => ({
        isFollowed:
          data !== undefined &&
          subredditSelectors.selectById(data, authorSub) !== undefined,
      }),
    }
  );

  // The intended state shows at once and holds until the subscribed list has
  // refetched; clearing it when the request resolves would show the stale
  // cache value while the refetch is still in flight.
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null);
  const following = optimisticFollowing ?? isFollowed;

  useEffect(() => {
    if (optimisticFollowing !== null && optimisticFollowing === isFollowed) {
      setOptimisticFollowing(null);
    }
  }, [optimisticFollowing, isFollowed]);

  const authorFlair = flair ? (
    <span className="badge bg-dark">{flair}</span>
  ) : null;

  const authorClasses = clsx({
    'is-followed': following,
    'is-submitter': isSubmitter,
  });

  return author === '[deleted]' ? (
    <div>
      <FontAwesomeIcon icon={faUser} /> {author}
    </div>
  ) : (
    <>
      {canFollow && (
        <PostBylineFollow
          author={author}
          authorSub={authorSub}
          following={following}
          onOptimistic={setOptimisticFollowing}
        />
      )}
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

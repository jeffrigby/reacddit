import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useFavoriteSubredditMutation } from '@/redux/api';
import { fetchSubreddits } from '@/redux/slices/subredditsSlice';

interface SubFavoriteProps {
  isFavorite: boolean;
  srName: string;
}

function SubFavorite({ isFavorite, srName }: SubFavoriteProps) {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.redditMe?.me);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const [error, setError] = useState<string | null>(null);

  // RTK Query mutation hook - provides isLoading automatically
  const [favoriteSubreddit, { isLoading }] = useFavoriteSubredditMutation();

  const favoriteIcon = isFavorite ? faHeart : farHeart;

  const toggleFavorite = useCallback(
    async (event?: MouseEvent<HTMLButtonElement>) => {
      if (event) {
        event.preventDefault();
      }

      if (isLoading) {
        return;
      }

      const newFavoriteState = !isFavorite;

      try {
        setError(null);

        await favoriteSubreddit({
          makeFavorite: newFavoriteState,
          srName,
        }).unwrap();

        // TODO: Remove this manual dispatch when subreddit query is migrated to RTK Query
        // For now, subreddit list still uses old Redux slice, so we need to manually refetch
        const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';
        dispatch(fetchSubreddits({ reset: true, where }));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An error occurred while updating favorite status';
        // TODO: add this to banner error message
        setError(errorMessage);
        console.error('Favorite toggle error:', err);
      }
    },
    [
      isFavorite,
      srName,
      favoriteSubreddit,
      isLoading,
      redditBearer.status,
      dispatch,
    ]
  );

  if (!me?.name) {
    return null;
  }

  const label = isFavorite
    ? `Remove ${srName} from favorites`
    : `Add ${srName} to favorites`;

  return (
    <>
      <Button
        aria-label={label}
        className="m-0 p-0 me-1 faded"
        disabled={isLoading}
        size="sm"
        title={label}
        variant="link"
        onClick={toggleFavorite}
      >
        <FontAwesomeIcon
          className={isLoading ? 'opacity-50' : ''}
          icon={favoriteIcon}
        />
      </Button>
      {error && (
        <small className="text-danger ms-1" role="alert">
          {error}
        </small>
      )}
    </>
  );
}

export default SubFavorite;

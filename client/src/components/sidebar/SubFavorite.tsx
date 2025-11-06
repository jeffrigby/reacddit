import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { useFavoriteSubredditMutation } from '@/redux/api';

interface SubFavoriteProps {
  isFavorite: boolean;
  srName: string;
}

function SubFavorite({ isFavorite, srName }: SubFavoriteProps) {
  const me = useAppSelector((state) => state.redditMe?.me);
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

        // Tag invalidation automatically refetches subreddit list - no manual dispatch needed!
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
    [isFavorite, srName, favoriteSubreddit, isLoading]
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

import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchSubreddits } from '@/redux/slices/subredditsSlice';
import { favorite } from '@/reddit/redditApiTs';

interface SubFavoriteProps {
  isFavorite: boolean;
  srName: string;
}

function SubFavorite({ isFavorite, srName }: SubFavoriteProps) {
  const me = useAppSelector((state) => state.redditMe?.me);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setIsLoading(true);
        setError(null);

        await favorite(newFavoriteState, srName);

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
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isLoading checked at function start
    [isFavorite, srName, redditBearer.status, dispatch]
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

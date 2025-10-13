import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { produce } from 'immer';
import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import type { AppDispatch } from '@/types/redux';
import type { SubredditData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { subredditsData } from '@/redux/actions/subreddits';
import { favorite } from '@/reddit/redditApiTs';

interface SubFavoriteProps {
  isFavorite: boolean;
  srName: string;
}

interface SubredditsState {
  status: string;
  subreddits: Record<string, SubredditData>;
  lastUpdated: number;
}

function SubFavorite({ isFavorite, srName }: SubFavoriteProps) {
  const me = useAppSelector((state) => state.redditMe?.me);
  const subreddits = useAppSelector(
    (state) => state.subreddits as SubredditsState
  );
  const dispatch = useDispatch<AppDispatch>();
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
      const subredditKey = srName.toLowerCase();

      // Optimistic update - Immer allows mutation in draft state
      const optimisticSubs = produce(subreddits, (draftState) => {
        if (draftState.subreddits[subredditKey]) {
          // eslint-disable-next-line no-param-reassign -- Immer draft state
          draftState.subreddits[subredditKey].user_has_favorited =
            newFavoriteState;
        }
      });

      try {
        setIsLoading(true);
        setError(null);

        // Update UI optimistically
        dispatch(subredditsData(optimisticSubs));
        await favorite(newFavoriteState, srName);
      } catch (err) {
        // Rollback on error
        dispatch(subredditsData(subreddits));

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
    [isFavorite, srName, subreddits, dispatch]
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

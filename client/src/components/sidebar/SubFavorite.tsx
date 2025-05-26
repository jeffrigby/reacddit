import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { produce } from 'immer';
import type { MouseEvent } from 'react';
import type { RootState, AppDispatch } from '@/types/redux';
import type { SubredditData } from '@/types/redditApi';
import { subredditsData } from '../../redux/actions/subreddits';
import { favorite } from '../../reddit/redditApiTs';

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
  const me = useSelector((state: RootState) => state.redditMe?.me);
  const subreddits = useSelector(
    (state: RootState) => state.subreddits as SubredditsState
  );
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconClass = isFavorite ? 'fas fa-heart' : 'far fa-heart';

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

      // Optimistic update
      const optimisticSubs = produce(subreddits, (draftState) => {
        if (draftState.subreddits[subredditKey]) {
          // eslint-disable-next-line no-param-reassign
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
    [isFavorite, srName, subreddits, dispatch, isLoading]
  );

  if (!me?.name) {
    return null;
  }

  const label = isFavorite
    ? `Remove ${srName} from favorites`
    : `Add ${srName} to favorites`;

  return (
    <>
      <button
        aria-label={label}
        className="btn btn-link btn-sm m-0 p-0 me-1 faded"
        disabled={isLoading}
        title={label}
        type="button"
        onClick={toggleFavorite}
      >
        <i className={`${iconClass} ${isLoading ? 'opacity-50' : ''}`} />
      </button>
      {error && (
        <small className="text-danger ms-1" role="alert">
          {error}
        </small>
      )}
    </>
  );
}

export default SubFavorite;

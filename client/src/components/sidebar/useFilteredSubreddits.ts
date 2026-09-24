import { useMemo } from 'react';
import type { EntityState } from '@reduxjs/toolkit';
import type { SubredditData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { useGetSubredditsQuery } from '@/redux/api';
import { selectFilterText } from '@/redux/slices/subredditFilterSlice';

type SubredditsQueryResult = ReturnType<typeof useGetSubredditsQuery>;
type SubredditsEntityState = EntityState<SubredditData, string>;

/** Which subreddit list the signed-in state calls for */
export type SubredditsWhere = 'default' | 'subscriber';

export interface FilteredSubreddits {
  /** Subscribed favorites matching the filter, in sidebar order */
  favorites: SubredditData[];
  /** Remaining subscribed subreddits matching the filter, in sidebar order */
  regular: SubredditData[];
  data: SubredditsEntityState | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: SubredditsQueryResult['refetch'];
  /** Which subreddit list the signed-in state calls for */
  where: SubredditsWhere;
}

/**
 * The subreddit list matching the current sign-in state.
 */
export function useSubredditsWhere(): SubredditsWhere {
  const status = useAppSelector((state) => state.redditBearer.status);
  return status === 'anon' ? 'default' : 'subscriber';
}

/**
 * Lowercased display names of every subscribed subreddit, filter ignored.
 *
 * Entity ids are the lowercased display names, so the set is built from the
 * id list rather than the entities themselves.
 */
export function useSubscribedNames(): ReadonlySet<string> {
  const where = useSubredditsWhere();
  const { ids } = useGetSubredditsQuery(
    { where },
    { selectFromResult: ({ data }) => ({ ids: data?.ids }) }
  );

  return useMemo(() => new Set(ids ?? []), [ids]);
}

const EMPTY_ENTITIES: SubredditsEntityState['entities'] = {};

/**
 * Subscribed subreddits keyed by lowercased display name, filter ignored.
 * Empty until the list has loaded.
 */
export function useSubscribedEntities(): SubredditsEntityState['entities'] {
  const where = useSubredditsWhere();
  const { entities } = useGetSubredditsQuery(
    { where },
    { selectFromResult: ({ data }) => ({ entities: data?.entities }) }
  );

  return entities ?? EMPTY_ENTITIES;
}

/**
 * Split subscribed subreddits into the two lists the sidebar renders.
 * User profile subreddits are excluded; a filter term matches anywhere in the
 * display name, case-insensitively. Entity ids are the lowercased display
 * names.
 */
function partitionSubreddits(
  data: SubredditsEntityState | undefined,
  filterText: string
): { favorites: SubredditData[]; regular: SubredditData[] } {
  const filterLower = filterText.toLowerCase();
  const favorites: SubredditData[] = [];
  const regular: SubredditData[] = [];

  for (const id of data?.ids ?? []) {
    if (filterLower !== '' && !id.includes(filterLower)) {
      continue;
    }
    const sub = data?.entities[id];
    if (!sub || sub.subreddit_type === 'user') {
      continue;
    }
    if (sub.user_has_favorited) {
      favorites.push(sub);
    } else {
      regular.push(sub);
    }
  }

  return { favorites, regular };
}

/**
 * Subscribed subreddits filtered by the sidebar filter box.
 */
export function useFilteredSubreddits(): FilteredSubreddits {
  const where = useSubredditsWhere();
  const filterText = useAppSelector(selectFilterText);
  const { data, isLoading, isError, refetch } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data, isLoading, isError }) => ({
        data,
        isLoading,
        isError,
      }),
    }
  );

  const { favorites, regular } = useMemo(
    () => partitionSubreddits(data, filterText),
    [data, filterText]
  );

  return { favorites, regular, data, isLoading, isError, refetch, where };
}

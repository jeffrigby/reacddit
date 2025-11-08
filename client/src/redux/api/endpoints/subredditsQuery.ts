/**
 * RTK Query endpoint for fetching subreddit list
 *
 * This endpoint replaces the subredditsSlice fetchSubreddits thunk.
 * Key features:
 * - Automatic pagination handling (Reddit's 100 subreddit limit)
 * - Normalized data with EntityAdapter
 * - Tag-based cache invalidation
 * - 1-hour cache retention
 *
 * The background polling for "last updated" timestamps remains
 * in subredditPollingSlice as a separate concern.
 */

import { createEntityAdapter } from '@reduxjs/toolkit';
import type { EntityState } from '@reduxjs/toolkit';
import { subreddits as subredditsAPI } from '@/reddit/redditApiTs';
import type { SubredditData, Thing } from '@/types/redditApi';
import { redditApi } from '../redditApi';

/**
 * EntityAdapter for normalized subreddit data
 * Matches the configuration from the original subredditsSlice
 */
const subredditsAdapter = createEntityAdapter<SubredditData, string>({
  selectId: (subreddit) => subreddit.display_name.toLowerCase(),
  sortComparer: (a, b) =>
    a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase()),
});

/**
 * Query argument type
 */
export type GetSubredditsArgs = {
  where?: 'subscriber' | 'default' | 'contributor' | 'moderator';
};

/**
 * Helper function to map Reddit API response to normalized state
 * Reused from original slice
 */
const mapSubreddits = (
  children: Thing<SubredditData>[]
): Record<string, SubredditData> => {
  const result: Record<string, SubredditData> = {};
  for (const thing of children) {
    const key = thing.data.display_name.toLowerCase();
    result[key] = thing.data;
  }
  return result;
};

/**
 * Fetch all subreddits with automatic pagination
 * Handles Reddit's 100 subreddit limit per request
 * Reused from original slice
 */
const fetchAllSubreddits = async (
  where: string
): Promise<Record<string, SubredditData>> => {
  let init = true;
  let qsAfter: string | null = null;
  const allMapped: Record<string, SubredditData>[] = [];

  // Paginate through all results
  while (init || qsAfter) {
    init = false;

    const srs = await subredditsAPI(where, {
      after: qsAfter,
      limit: 100,
    });

    const mapped = mapSubreddits(srs.data.children);
    allMapped.push(mapped);
    qsAfter = srs.data.after ?? null;
  }

  // Merge all pages into single object
  return Object.assign({}, ...allMapped);
};

/**
 * Extended Reddit API with subreddit query endpoint
 */
export const subredditsQueryApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get user's subreddit list
     *
     * @param where - Type of subreddits to fetch
     *   - 'subscriber': User's subscribed subreddits (default)
     *   - 'default': Default subreddits (for anon users)
     *   - 'contributor': Subreddits user is approved submitter in
     *   - 'moderator': Subreddits user moderates
     *
     * Returns normalized EntityState for efficient lookups and sorted display.
     *
     * Automatic refetch triggers:
     * - Subscribe/unsubscribe mutation completes
     * - Favorite/unfavorite mutation completes
     * - Follow/unfollow user completes
     */
    getSubreddits: builder.query<
      EntityState<SubredditData, string>,
      GetSubredditsArgs | void
    >({
      // Use custom queryFn for complex pagination logic
      async queryFn(args, _api, _extraOptions, _baseQuery) {
        const where = args?.where ?? 'subscriber';

        try {
          // Fetch all pages
          const subreddits = await fetchAllSubreddits(where);

          // Normalize with EntityAdapter
          const normalizedState = subredditsAdapter.setAll(
            subredditsAdapter.getInitialState(),
            subreddits
          );

          return { data: normalizedState };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch subreddits',
            },
          };
        }
      },

      // Use LIST pattern for granular cache invalidation
      // Mutations invalidate 'LIST' to trigger full refetch
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({
                type: 'Subreddits' as const,
                id: id,
              })),
              { type: 'Subreddits', id: 'LIST' },
            ]
          : [{ type: 'Subreddits', id: 'LIST' }],

      // Cache for 1 hour (overrides global 1-minute default)
      keepUnusedDataFor: 3600, // 1 hour
    }),
  }),
});

// Export hook for use in components
export const { useGetSubredditsQuery } = subredditsQueryApi;

// Export EntityAdapter selectors for use in components
// These work with the EntityState returned from the query
export const subredditSelectors = subredditsAdapter.getSelectors();

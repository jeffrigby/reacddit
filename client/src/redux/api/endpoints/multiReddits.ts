/**
 * RTK Query endpoints for Reddit MultiReddits (Custom Feeds)
 *
 * Endpoints:
 * - getMultiReddits: Fetch user's multireddits
 * - addSubredditToMulti: Add subreddit to a multireddit
 * - deleteMultiReddit: Delete a multireddit
 *
 * Cache behavior:
 * - 24-hour cache with tag-based invalidation on modifications
 */

import type { Thing, LabeledMultiData } from '@/types/redditApi';
import { redditApi } from '../redditApi';

/**
 * Extended Reddit API with multiReddits endpoints
 */
export const multiRedditsApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get user's multireddits (custom feeds)
     *
     * @param expandSubreddits - Include full subreddit details (default: true)
     * @returns Array of multireddit data
     */
    getMultiReddits: builder.query<
      Thing<LabeledMultiData>[],
      { expandSubreddits?: boolean } | void
    >({
      query: (args) => ({
        url: '/api/multi/mine',
        method: 'GET',
        params: {
          expand_srs: args?.expandSubreddits ?? true,
        },
      }),
      // Use LIST pattern for granular cache invalidation
      providesTags: (result) =>
        result
          ? [
              ...result.map((multi) => ({
                type: 'MultiReddits' as const,
                id: multi.data.path,
              })),
              { type: 'MultiReddits', id: 'LIST' },
            ]
          : [{ type: 'MultiReddits', id: 'LIST' }],
      // Long cache - multis rarely change (overrides global 1-minute default)
      keepUnusedDataFor: 3600 * 24, // 24 hours
    }),

    /**
     * Add a subreddit to a multireddit
     *
     * @param multiPath - Path to the multireddit (e.g., /user/username/m/multiname)
     * @param srName - Subreddit name to add
     */
    addSubredditToMulti: builder.mutation<
      void,
      { multiPath: string; srName: string }
    >({
      query: ({ multiPath, srName }) => ({
        url: `${multiPath}/r/${srName}`,
        method: 'PUT',
        data: { model: JSON.stringify({ name: srName }) },
      }),
      // Invalidate specific multi and LIST
      invalidatesTags: (result, error, { multiPath }) => [
        { type: 'MultiReddits', id: multiPath },
        { type: 'MultiReddits', id: 'LIST' },
      ],
    }),

    /**
     * Remove a subreddit from a multireddit
     *
     * @param multiPath - Path to the multireddit (e.g., /user/username/m/multiname)
     * @param srName - Subreddit name to remove
     */
    removeSubredditFromMulti: builder.mutation<
      void,
      { multiPath: string; srName: string }
    >({
      query: ({ multiPath, srName }) => ({
        url: `${multiPath}/r/${srName}`,
        method: 'DELETE',
      }),
      // Invalidate specific multi and LIST
      invalidatesTags: (result, error, { multiPath }) => [
        { type: 'MultiReddits', id: multiPath },
        { type: 'MultiReddits', id: 'LIST' },
      ],
    }),

    /**
     * Delete a multireddit
     *
     * @param multiPath - Path to the multireddit (e.g., /user/username/m/multiname)
     */
    deleteMultiReddit: builder.mutation<void, string>({
      query: (multiPath) => ({
        url: `${multiPath}`,
        method: 'DELETE',
      }),
      // Delete removes from list, invalidate LIST only
      invalidatesTags: [{ type: 'MultiReddits', id: 'LIST' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetMultiRedditsQuery,
  useAddSubredditToMultiMutation,
  useRemoveSubredditFromMultiMutation,
  useDeleteMultiRedditMutation,
} = multiRedditsApi;

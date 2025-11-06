/**
 * RTK Query endpoints for Reddit MultiReddits (Custom Feeds)
 *
 * This file contains endpoints for:
 * - Fetching user's multireddits
 * - Adding/removing subreddits from multireddits
 * - Deleting multireddits
 *
 * Migration from multiRedditsSlice.ts:
 * - Replaces fetchMultiReddits async thunk
 * - Automatic caching (replaces manual 24-hour cache)
 * - Tag-based invalidation (replaces manual refetch calls)
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
     * Replaces: fetchMultiReddits async thunk from multiRedditsSlice
     *
     * Cache behavior:
     * - Default caching with automatic invalidation via tags
     * - Manual refetch via refetch() or invalidateTags(['MultiReddits'])
     *
     * @param expandSubreddits - Include full subreddit details (default: true)
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
      providesTags: ['MultiReddits'],
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
      // Invalidate multireddits cache after adding subreddit
      invalidatesTags: ['MultiReddits'],
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
      // Invalidate multireddits cache after removing subreddit
      invalidatesTags: ['MultiReddits'],
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
      // Invalidate multireddits cache after deletion
      invalidatesTags: ['MultiReddits'],
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

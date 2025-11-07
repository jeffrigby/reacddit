/**
 * RTK Query endpoints for Reddit MultiReddits (Custom Feeds)
 *
 * Endpoints:
 * - getMultiReddits: Fetch user's multireddits
 * - getMultiRedditInfo: Get information about a specific multireddit
 * - addMultiReddit: Create a new multireddit
 * - addSubredditToMulti: Add subreddit to a multireddit
 * - removeSubredditFromMulti: Remove subreddit from a multireddit
 * - deleteMultiReddit: Delete a multireddit
 *
 * Cache behavior:
 * - 24-hour cache with tag-based invalidation on modifications
 */

import queryString from 'query-string';
import type {
  Thing,
  LabeledMultiData,
  MultiInfoResponse,
  ApiResponse,
} from '@/types/redditApi';
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
      // Tags each multi individually + LIST for granular invalidation
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
      keepUnusedDataFor: 3600 * 24, // 24-hour cache - multis rarely change
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
        url: `/api/multi/${multiPath.replace(/^\/+|\/+$/g, '')}/r/${srName}`,
        method: 'PUT',
        data: `model=${encodeURIComponent(JSON.stringify({ name: srName }))}`,
      }),
      // Invalidate both the specific multi and the full LIST
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
        url: `/api/multi/${multiPath.replace(/^\/+|\/+$/g, '')}/r/${srName}`,
        method: 'DELETE',
      }),
      // Invalidate both the specific multi and the full LIST
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
        url: `/api/multi/${multiPath.replace(/^\/+|\/+$/g, '')}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MultiReddits', id: 'LIST' }],
    }),

    /**
     * Get information about a specific multireddit
     *
     * @param multiPath - Path to the multireddit (e.g., user/username/m/multiname)
     * @returns Multireddit information including metadata and subreddit list
     */
    getMultiRedditInfo: builder.query<MultiInfoResponse, string>({
      query: (multiPath) => ({
        url: `/api/multi/${multiPath}`,
        method: 'GET',
      }),
      providesTags: (result, error, multiPath) => [
        { type: 'MultiReddits', id: multiPath },
      ],
      keepUnusedDataFor: 3600 * 24,
    }),

    /**
     * Create a new multireddit
     *
     * @param name - Display name for the multireddit (max 50 characters)
     * @param description - Description in markdown format
     * @param visibility - Visibility setting ('private' or 'public')
     * @returns API response
     */
    addMultiReddit: builder.mutation<
      ApiResponse,
      { name: string; description: string; visibility: 'private' | 'public' }
    >({
      query: ({ name, description, visibility }) => ({
        url: '/api/multi',
        method: 'POST',
        data: queryString.stringify({
          model: JSON.stringify({
            description_md: description,
            display_name: name,
            visibility,
          }),
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      invalidatesTags: [{ type: 'MultiReddits', id: 'LIST' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetMultiRedditsQuery,
  useGetMultiRedditInfoQuery,
  useAddMultiRedditMutation,
  useAddSubredditToMultiMutation,
  useRemoveSubredditFromMultiMutation,
  useDeleteMultiRedditMutation,
} = multiRedditsApi;

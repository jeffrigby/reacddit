/**
 * RTK Query endpoints for Reddit voting and saving
 *
 * This file contains mutations for:
 * - Voting on posts/comments (upvote, downvote, unvote)
 * - Saving/unsaving posts
 *
 * Note: These components already use React 19's useOptimistic hook for instant UI feedback.
 * The mutations here handle the API call and can optionally invalidate related caches.
 */

import queryString from 'query-string';
import { redditApi } from '../redditApi';

type VoteDirection = -1 | 0 | 1;

interface VoteParams {
  id: string; // Thing fullname (e.g., "t3_abc123" for posts, "t1_xyz789" for comments)
  dir: VoteDirection; // -1 = downvote, 0 = unvote, 1 = upvote
}

interface SaveParams {
  id: string; // Thing fullname
  category?: string; // Optional save category
}

interface UnsaveParams {
  id: string; // Thing fullname
}

/**
 * Extended Reddit API with vote/save endpoints
 */
export const votesApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Vote on a post or comment
     *
     * @param id - Thing fullname (e.g., "t3_abc123")
     * @param dir - Vote direction: -1 (downvote), 0 (unvote), 1 (upvote)
     *
     * Note: Components should handle optimistic updates via useOptimistic.
     * This mutation focuses on the API call.
     */
    vote: builder.mutation<void, VoteParams>({
      query: ({ id, dir }) => ({
        url: '/api/vote',
        method: 'POST',
        data: queryString.stringify({
          id,
          dir,
          rank: 1, // Required by Reddit API
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      // Don't invalidate tags - votes are optimistic and don't need refetch
      // The component handles UI updates via useOptimistic
    }),

    /**
     * Save a post or comment
     *
     * @param id - Thing fullname
     * @param category - Optional category for saved item
     *
     * Note: Components should handle optimistic updates via useOptimistic.
     */
    savePost: builder.mutation<void, SaveParams>({
      query: ({ id, category }) => ({
        url: '/api/save',
        method: 'POST',
        data: queryString.stringify(category ? { id, category } : { id }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      // Don't invalidate tags - saves are optimistic and don't need refetch
    }),

    /**
     * Unsave a post or comment
     *
     * @param id - Thing fullname
     *
     * Note: Components should handle optimistic updates via useOptimistic.
     */
    unsavePost: builder.mutation<void, UnsaveParams>({
      query: ({ id }) => ({
        url: '/api/unsave',
        method: 'POST',
        data: queryString.stringify({ id }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      // Don't invalidate tags - unsaves are optimistic and don't need refetch
    }),
  }),
});

// Export hooks for use in components
export const { useVoteMutation, useSavePostMutation, useUnsavePostMutation } =
  votesApi;

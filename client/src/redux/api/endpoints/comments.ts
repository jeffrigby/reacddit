/**
 * RTK Query endpoints for Reddit Comments
 *
 * Endpoints:
 * - getMoreChildren: Load more comments (expand "load more comments" links)
 *
 * Cache behavior:
 * - Short cache (60 seconds) for comment trees
 */

import type { MoreChildrenResponse } from '@/types/redditApi';
import { getMoreComments } from '@/reddit/redditApiTs';
import { redditApi } from '../redditApi';

interface GetMoreChildrenArgs {
  linkId: string;
  children: string[];
}

/**
 * Extended Reddit API with comments endpoints
 */
export const commentsApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Load more comments (expand "load more comments" links)
     *
     * @param linkId - The post fullname (t3_xxx)
     * @param children - Array of comment IDs to load
     * @returns More comments data with nested replies
     */
    getMoreChildren: builder.query<MoreChildrenResponse, GetMoreChildrenArgs>({
      queryFn: async ({ linkId, children }) => {
        try {
          // Calls legacy helper function from redditApiTs.ts
          const result = await getMoreComments(linkId, children);
          return { data: result };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data:
                error instanceof Error
                  ? error.message
                  : 'Failed to load more comments',
            },
          };
        }
      },
      keepUnusedDataFor: 60, // Short cache - comment trees can change frequently
    }),
  }),
});

// Export hooks for use in components
export const { useGetMoreChildrenQuery } = commentsApi;

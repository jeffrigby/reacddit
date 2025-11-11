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
import { setParams } from '@/reddit/redditApiTs';
import { redditApi } from '@/redux/api/redditApi';

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
      query: ({ linkId, children }) => {
        const params = setParams({
          link_id: linkId,
          children: children.join(','),
          raw_json: 1,
          api_type: 'json',
          depth: undefined,
          id: undefined,
          limit_children: false,
        });

        return {
          url: 'api/morechildren',
          method: 'GET',
          params,
        };
      },
      keepUnusedDataFor: 60, // Short cache - comment trees can change frequently
    }),
  }),
});

// Export hooks for use in components
export const { useGetMoreChildrenQuery } = commentsApi;

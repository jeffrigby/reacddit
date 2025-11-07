/**
 * RTK Query endpoints for Reddit Search
 *
 * Endpoints:
 * - searchSubredditsByName: Search for subreddits by name
 *
 * Cache behavior:
 * - Short cache (60 seconds) for frequently-changing search results
 */

import type { SearchSubredditsResponse } from '@/types/redditApi';
import { searchSubreddits } from '@/reddit/redditApiTs';
import { redditApi } from '../redditApi';

interface SearchSubredditsArgs {
  query: string;
  includeOver18?: boolean;
}

/**
 * Extended Reddit API with search endpoints
 */
export const searchApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Search for subreddits by name
     *
     * @param query - Search query string
     * @param includeOver18 - Include NSFW subreddits (default: false)
     * @returns Search results with subreddit names and metadata
     */
    searchSubredditsByName: builder.query<
      SearchSubredditsResponse,
      SearchSubredditsArgs
    >({
      queryFn: async ({ query, includeOver18 = false }) => {
        try {
          // Calls legacy helper function from redditApiTs.ts
          const results = await searchSubreddits(query, {
            include_over_18: includeOver18,
          });
          return { data: results };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data: error instanceof Error ? error.message : 'Search failed',
            },
          };
        }
      },
      keepUnusedDataFor: 60, // Short cache - search results change frequently
    }),
  }),
});

// Export hooks for use in components
export const { useSearchSubredditsByNameQuery } = searchApi;

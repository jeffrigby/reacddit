/**
 * RTK Query endpoints for Reddit Search
 *
 * Endpoints:
 * - searchSubredditsByName: Search for subreddits by name
 *
 * Cache behavior:
 * - Short cache (60 seconds) for frequently-changing search results
 */

import queryString from 'query-string';
import type { SearchSubredditsResponse } from '@/types/redditApi';
import { setParams } from '@/reddit/redditApiTs';
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
      query: ({ query, includeOver18 = false }) => {
        const params = setParams({
          query,
          exact: false,
          include_over_18: includeOver18,
          include_unadvertisable: true,
          raw_json: 1,
          api_type: 'json',
        });

        return {
          url: '/api/search_subreddits',
          method: 'POST',
          data: queryString.stringify(params),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
      keepUnusedDataFor: 60, // Short cache - search results change frequently
    }),
  }),
});

// Export hooks for use in components
export const { useSearchSubredditsByNameQuery } = searchApi;

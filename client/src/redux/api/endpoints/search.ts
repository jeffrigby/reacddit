/**
 * RTK Query endpoints for Reddit Search
 *
 * Endpoints:
 * - searchSubreddits: Search subreddits via /subreddits/search
 *
 * /subreddits/search matches on subreddit name, title and description tokens
 * (not arbitrary substrings) and ignores the sort parameter, so result order
 * is decided client-side.
 *
 * Cache behavior:
 * - Short cache (60 seconds) for frequently-changing search results
 */

import type { SubredditsListingResponse } from '@/types/redditApi';
import { redditApi } from '@/redux/api/redditApi';

/** Results requested per search. Reddit caps this at 100. */
const SEARCH_LIMIT = 50;

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
     * Search for subreddits
     *
     * @param query - Search query string
     * @param includeOver18 - Include NSFW subreddits (default: false)
     * @returns Listing of matching subreddits
     */
    searchSubreddits: builder.query<
      SubredditsListingResponse,
      SearchSubredditsArgs
    >({
      query: ({ query, includeOver18 = false }) => ({
        url: '/subreddits/search',
        method: 'GET',
        params: {
          q: query,
          limit: SEARCH_LIMIT,
          raw_json: 1,
          include_over_18: includeOver18 ? 'on' : undefined,
        },
      }),
      keepUnusedDataFor: 60, // Short cache - search results change frequently
    }),
  }),
});

// Export hooks for use in components
export const { useSearchSubredditsQuery } = searchApi;

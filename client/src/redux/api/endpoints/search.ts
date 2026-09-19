/**
 * RTK Query endpoints for Reddit Search
 *
 * Endpoints:
 * - searchSubreddits: Search subreddits via /subreddits/search
 * - searchSubredditNames: Name-prefix matches via /api/search_reddit_names
 * - searchUsers: Search user profiles via /users/search
 * - usernameAvailable: Whether an exact user name is unclaimed
 *
 * /subreddits/search matches on subreddit name, title and description tokens
 * (not arbitrary substrings) and ignores the sort parameter, so result order
 * is decided client-side. /users/search is a text search over profile
 * content, so a low-activity account is only found by its exact name through
 * usernameAvailable.
 *
 * Cache behavior:
 * - Short cache (60 seconds) for frequently-changing search results
 */

import type {
  SearchRedditNamesResponse,
  SubredditsListingResponse,
  UsernameAvailableResponse,
  UsersSearchResponse,
} from '@/types/redditApi';
import { redditApi } from '@/redux/api/redditApi';

/** Results requested per search. Reddit caps this at 100. */
const SEARCH_LIMIT = 50;
/** User profiles requested per search. */
const USER_SEARCH_LIMIT = 10;

interface SearchSubredditsArgs {
  query: string;
  includeOver18?: boolean;
}

interface SearchUsersArgs {
  query: string;
}

interface UsernameAvailableArgs {
  user: string;
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

    /**
     * Subreddit names starting with the query, at most ten, including
     * private and unindexed subreddits /subreddits/search does not return
     *
     * @param query - Name prefix
     * @param includeOver18 - Include NSFW subreddits (default: false)
     */
    searchSubredditNames: builder.query<
      SearchRedditNamesResponse,
      SearchSubredditsArgs
    >({
      query: ({ query, includeOver18 = false }) => ({
        url: '/api/search_reddit_names',
        method: 'GET',
        params: {
          query,
          include_over_18: includeOver18,
          raw_json: 1,
        },
      }),
      keepUnusedDataFor: 60,
    }),

    /**
     * Search user profiles
     *
     * @param query - Search query string
     * @returns Listing of matching accounts
     */
    searchUsers: builder.query<UsersSearchResponse, SearchUsersArgs>({
      query: ({ query }) => ({
        url: '/users/search',
        method: 'GET',
        params: {
          q: query,
          limit: USER_SEARCH_LIMIT,
          raw_json: 1,
        },
      }),
      keepUnusedDataFor: 60,
    }),

    /**
     * Whether a user name is unclaimed; false means the account exists
     *
     * @param user - Exact user name
     */
    usernameAvailable: builder.query<
      UsernameAvailableResponse,
      UsernameAvailableArgs
    >({
      query: ({ user }) => ({
        url: '/api/username_available',
        method: 'GET',
        params: { user },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
});

// Export hooks for use in components
export const {
  useSearchSubredditsQuery,
  useSearchSubredditNamesQuery,
  useSearchUsersQuery,
  useUsernameAvailableQuery,
} = searchApi;

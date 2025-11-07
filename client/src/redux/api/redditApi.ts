import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { redditAPI } from '@/reddit/redditApiTs';

/**
 * Custom axios-based base query for RTK Query
 * Uses the existing redditAPI axios instance which has the bearer token interceptor
 */
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await redditAPI({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };

/**
 * Reddit API slice for RTK Query
 *
 * This is the base API slice that will be extended with endpoints using injectEndpoints.
 *
 * Features:
 * - Uses existing axios instance with bearer token interceptor
 * - Automatic request deduplication
 * - Built-in caching with tag-based invalidation
 * - TypeScript types auto-generated from endpoint definitions
 *
 * Tag Types:
 * - MultiReddits: User's custom multireddit feeds
 * - Me: Logged-in user profile data
 * - Subreddits: User's subscribed subreddits
 * - Listings: Post listings (subreddit, search, user, etc.)
 * - Post: Individual post data
 * - Comments: Post comments
 */
export const redditApi = createApi({
  reducerPath: 'redditApi',
  baseQuery: axiosBaseQuery({ baseUrl: '' }), // baseURL is already set in redditAPI instance
  tagTypes: [
    'MultiReddits',
    'Me',
    'Subreddits',
    'Listings',
    'Post',
    'Comments',
  ],

  // Global cache configuration
  // Individual endpoints can override these settings
  // NOTE: Listings/posts update frequently, so default is short
  // Static data (me, subreddits, multis) override with longer keepUnusedDataFor
  keepUnusedDataFor: 60, // 1 minute default for frequently-updating data (listings, posts)
  refetchOnMountOrArgChange: 120, // Refetch if data is older than 2 minutes
  refetchOnFocus: false, // Don't auto-refetch on window focus (handled by autorefresh feature)
  refetchOnReconnect: true, // Do refetch on network reconnect

  endpoints: () => ({}), // Endpoints will be injected from separate files
});

// Export hooks for usage in functional components
// Note: Endpoint-specific hooks are exported from their respective endpoint files
export const {} = redditApi;

// Export the reducer and middleware for store configuration
export const { reducer: redditApiReducer, middleware: redditApiMiddleware } =
  redditApi;

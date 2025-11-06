/**
 * RTK Query endpoints for Reddit User Account (Me)
 *
 * This file contains endpoints for:
 * - Fetching logged-in user account information
 *
 * Migration from redditMeSlice.ts:
 * - Replaces fetchMe async thunk
 * - Automatic caching with tag-based invalidation
 * - Simplified cache logic (RTK Query handles most complexity)
 *
 * Note: The original slice had complex caching based on bearer token matching.
 * RTK Query will re-fetch when the bearer changes because the component will unmount/remount
 * or we can manually invalidate the cache when auth status changes.
 */

import type { AccountData } from '@/types/redditApi';
import { redditApi } from '../redditApi';

/**
 * Extended Reddit API with user account endpoints
 */
export const meApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get logged-in user's account information
     *
     * Replaces: fetchMe async thunk from redditMeSlice
     *
     * Cache behavior:
     * - Cached with 'Me' tag
     * - Automatically refetched when invalidated
     * - Cache buster parameter (cb) prevents Firefox caching
     *
     * Original cache logic:
     * - Anonymous users: 24-hour cache
     * - Authenticated users: cache valid while bearer matches
     * RTK Query approach:
     * - Use keepUnusedDataFor for cache duration
     * - Invalidate cache when bearer changes (component-level logic)
     */
    getMe: builder.query<AccountData, void>({
      query: () => ({
        url: `/api/v1/me?cb=${Date.now()}`, // Cache buster for Firefox
        method: 'GET',
      }),
      providesTags: ['Me'],
      // Keep data for 24 hours (matching original CACHE_EXPIRATION_ANON)
      keepUnusedDataFor: 3600 * 24,
    }),
  }),
});

// Export hooks for use in components
export const { useGetMeQuery, useLazyGetMeQuery } = meApi;

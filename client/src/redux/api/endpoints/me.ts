/**
 * RTK Query endpoints for Reddit User Account (Me)
 *
 * Endpoints:
 * - getMe: Fetch logged-in user account information
 *
 * Cache behavior:
 * - 24-hour cache with automatic invalidation on auth changes
 * - Cache buster parameter prevents browser caching issues
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
     * @returns AccountData for the currently authenticated user
     */
    getMe: builder.query<AccountData, void>({
      query: () => ({
        url: `/api/v1/me?cb=${Date.now()}`, // Cache buster for Firefox
        method: 'GET',
      }),
      providesTags: ['Me'],
      // Long cache - user profile rarely changes (overrides global 1-minute default)
      keepUnusedDataFor: 3600 * 24, // 24 hours
    }),
  }),
});

// Export hooks for use in components
export const { useGetMeQuery, useLazyGetMeQuery } = meApi;

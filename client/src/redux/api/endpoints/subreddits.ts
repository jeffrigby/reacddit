/**
 * RTK Query endpoints for subreddit subscriptions and favorites
 *
 * This file contains mutations for:
 * - Subscribing to subreddits
 * - Unsubscribing from subreddits
 * - Favoriting/unfavoriting subreddits
 *
 * Key benefit: Automatic cache invalidation via tags.
 * When you subscribe/unsubscribe/favorite, the subreddit list automatically refetches.
 * No more manual dispatch(fetchSubreddits({ reset: true }))!
 */

import queryString from 'query-string';
import { redditApi } from '../redditApi';

interface SubscribeParams {
  name: string; // Subreddit name (e.g., "pics") or fullname (e.g., "t5_2qh0u")
  action: 'sub' | 'unsub';
  type?: 'sr' | 'sr_name'; // Default: 'sr_name'
}

interface FavoriteParams {
  makeFavorite: boolean;
  srName: string;
}

/**
 * Extended Reddit API with subreddit subscription endpoints
 */
export const subredditsApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Subscribe to a subreddit
     *
     * @param name - Subreddit name or fullname
     * @param action - 'sub' to subscribe, 'unsub' to unsubscribe
     * @param type - 'sr' for fullname, 'sr_name' for name (default)
     *
     * After successful subscription, automatically refetches subreddit lists
     * via tag invalidation. No manual refetch needed!
     */
    subscribeToSubreddit: builder.mutation<void, SubscribeParams>({
      query: ({ name, action, type = 'sr_name' }) => {
        const params: Record<string, string> = { action };

        if (type === 'sr') {
          params.sr = name;
        } else {
          params.sr_name = name;
        }

        return {
          url: '/api/subscribe',
          method: 'POST',
          data: queryString.stringify(params),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
      // Invalidate LIST to trigger full refetch since subscription changes the list
      invalidatesTags: [{ type: 'Subreddits', id: 'LIST' }],
    }),

    /**
     * Favorite or unfavorite a subreddit
     *
     * @param makeFavorite - true to favorite, false to unfavorite
     * @param srName - Subreddit name
     *
     * After successful favorite/unfavorite, automatically refetches subreddit lists
     * via tag invalidation.
     */
    favoriteSubreddit: builder.mutation<void, FavoriteParams>({
      query: ({ makeFavorite, srName }) => ({
        url: '/api/favorite',
        method: 'POST',
        data: queryString.stringify({
          make_favorite: makeFavorite.toString(),
          sr_name: srName,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      // Invalidate both the specific subreddit AND the LIST
      invalidatesTags: (result, error, { srName }) => [
        { type: 'Subreddits', id: srName.toLowerCase() },
        { type: 'Subreddits', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const { useSubscribeToSubredditMutation, useFavoriteSubredditMutation } =
  subredditsApi;

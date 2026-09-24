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

import { redditApi } from '@/redux/api/redditApi';
import { listingsApi } from './listings';

interface SubscribeParams {
  name: string; // Subreddit name (e.g., "pics") or fullname (e.g., "t5_2qh0u")
  action: 'sub' | 'unsub';
  type?: 'sr' | 'sr_name'; // Default: 'sr_name'
  /** Display name, when the subreddit's cached about entry should follow */
  displayName?: string;
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
     * @param displayName - Display name whose cached about entry carries
     *   user_is_subscriber; it is patched at once and refetched on success
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
          data: new URLSearchParams(params).toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
      // Every cached about entry for the subreddit shows the new state at
      // once, so each reader of it updates together; a failed request puts
      // the old state back.
      async onQueryStarted(
        { action, displayName },
        { dispatch, getState, queryFulfilled }
      ) {
        if (!displayName) {
          return;
        }
        const lowerName = displayName.toLowerCase();
        const patches = listingsApi.util
          .selectCachedArgsForQuery(getState(), 'getSubredditAbout')
          .filter((args) => args.subreddit.toLowerCase() === lowerName)
          .map((args) =>
            dispatch(
              listingsApi.util.updateQueryData(
                'getSubredditAbout',
                args,
                (draft) => {
                  if ('name' in draft) {
                    draft.user_is_subscriber = action === 'sub';
                  }
                }
              )
            )
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      // The list changes, and so does user_is_subscriber on the about entry
      invalidatesTags: (_result, _error, { displayName }) => [
        ...(displayName
          ? [{ type: 'Subreddits' as const, id: displayName.toLowerCase() }]
          : []),
        { type: 'Subreddits' as const, id: 'LIST' },
      ],
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
        data: new URLSearchParams({
          make_favorite: makeFavorite.toString(),
          sr_name: srName,
        }).toString(),
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

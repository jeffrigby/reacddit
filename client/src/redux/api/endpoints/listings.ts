/**
 * RTK Query endpoints for Reddit listings (posts)
 *
 * Key features:
 * - Single endpoint with custom merge logic for all fetch types (initial, pagination, streaming)
 * - Automatic streaming via polling when enabled
 * - Memory management with post truncation
 * - Separate caching for subreddit about data
 */

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import queryString from 'query-string';
import type { ListingsFilter } from '@/types/listings';
import type {
  Thing,
  LinkData,
  SubredditData,
  Listing,
} from '@/types/redditApi';
import {
  getListingSubreddit,
  getListingMulti,
  getListingUser,
  getListingSearch,
  getListingSearchMulti,
  getListingDuplicates,
  getComments,
  subredditAbout,
} from '@/reddit/redditApiTs';
import { redditApi } from '@/redux/api/redditApi';

/**
 * Type for entries returned by getContent after keying children
 */
interface KeyedListingData {
  data: {
    before: string | null;
    after: string | null;
    children: Record<string, Thing<LinkData>>;
  };
  requestUrl?: string;
  originalPost?: Listing<LinkData>;
}

/**
 * Base listing structure with array children
 */
interface BaseListingResponse {
  data: {
    children: Array<{ data: { name: string } }>;
    before: string | null;
    after: string | null;
  };
  requestUrl?: string;
  originalPost?: Listing<LinkData>;
}

/**
 * Transform listing children array to keyed object by name
 */
function keyEntryChildren(entries: BaseListingResponse): KeyedListingData {
  const newChildren: Record<string, Thing<LinkData>> = {};
  for (const item of entries.data.children) {
    newChildren[item.data.name] = item as Thing<LinkData>;
  }

  return {
    data: {
      before: entries.data.before,
      after: entries.data.after,
      children: newChildren,
    },
    requestUrl: entries.requestUrl,
    originalPost: entries.originalPost,
  };
}

const MAX_POSTS_IN_MEMORY = 500;

/**
 * Query argument types
 */
export interface GetListingsArgs {
  filters: ListingsFilter;
  pagination?: {
    after?: string;
    before?: string;
    limit?: number;
  };
  location: {
    key?: string;
    search: string;
  };
}

export interface GetSubredditAboutArgs {
  subreddit: string;
  listType: string;
  multi: boolean;
}

/**
 * Response types
 */
export interface ListingsData {
  before: string | null;
  after: string | null;
  children: Record<string, Thing<LinkData>>;
  originalPost?: Thing<LinkData>;
  requestUrl?: string;
  saved: number;
}

/**
 * Helper to fetch content based on filter type
 * Reused from original listingsSlice
 */
async function getContent(
  filters: ListingsFilter,
  params: Record<string, unknown>
) {
  const target = filters.target !== 'mine' ? filters.target : null;
  const { user, sort, multi, listType, postName, comment } = filters;

  let entries;

  switch (listType) {
    case 'r':
      entries = await getListingSubreddit(target, sort ?? 'hot', params);
      break;
    case 'm':
      entries = await getListingMulti(
        user ?? '',
        target ?? '',
        sort ?? 'hot',
        params
      );
      break;
    case 'u':
      entries = await getListingUser(
        user ?? '',
        target === 'posts' ? 'submitted' : (target ?? 'submitted'),
        sort ?? 'hot',
        params
      );
      break;
    case 's':
      entries = multi
        ? await getListingSearchMulti(user ?? '', target ?? '', params)
        : await getListingSearch(target ?? '', params);
      break;
    case 'duplicates': {
      const dupes = await getListingDuplicates(target ?? '', params);
      entries = {
        ...dupes[1],
        originalPost: dupes[0],
        requestUrl: dupes.requestUrl,
      };
      break;
    }
    case 'comments': {
      const comments = await getComments(
        target ?? '',
        postName ?? '',
        comment ?? '',
        params
      );
      entries = {
        ...comments[1],
        originalPost: comments[0],
        requestUrl: comments.requestUrl,
      };
      break;
    }
    default:
      throw new Error(`Unknown listType: ${listType}`);
  }

  if (entries) {
    entries = keyEntryChildren(entries);
  }

  return entries;
}

/**
 * Serialize filter for cache key
 * Only include properties that affect the content
 */
function serializeFilterKey(filters: ListingsFilter): string {
  const { listType, target, sort, user, multi, postName, comment } = filters;
  return JSON.stringify({
    listType,
    target,
    sort,
    user,
    multi,
    postName,
    comment,
  });
}

/**
 * Extended Reddit API with listings endpoints
 */
export const listingsApi = redditApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get listings (posts) for any listing type
     *
     * Handles all listing types: subreddit, user, multi, search, duplicates, comments
     * Supports three fetch patterns via pagination arg:
     * - Initial: no pagination → replace all data
     * - Next: { after } → append more posts
     * - New: { before } → prepend new posts (streaming/refresh)
     *
     * Automatic features:
     * - Memory management: truncates to 500 posts when streaming
     * - Smart merging: prepend vs append based on pagination direction
     * - Parallel subreddit about fetch (use separate query)
     */
    getListings: builder.query<ListingsData, GetListingsArgs>({
      async queryFn(args, _api, _extraOptions, _baseQuery) {
        const { filters, pagination, location } = args;

        try {
          // Parse query string params from location
          const qs = queryString.parse(location.search);
          const params: Record<string, unknown> = { ...qs };

          // Set pagination params
          if (pagination?.after) {
            params.after = pagination.after;
            params.limit = pagination.limit ?? 50;
          } else if (pagination?.before) {
            params.before = pagination.before;
            params.limit = pagination.limit ?? 100;
          } else {
            // Initial load - use provided limit or default
            params.limit = pagination?.limit ?? 25;
          }

          // Fetch content
          const entries = await getContent(filters, params);

          const data: ListingsData = {
            before: entries.data.before,
            after: entries.data.after,
            children: entries.data.children,
            requestUrl: entries.requestUrl,
            saved: Date.now(),
          };

          // Handle special cases: duplicates and comments include original post
          if (
            entries.originalPost &&
            (filters.listType === 'duplicates' ||
              filters.listType === 'comments')
          ) {
            data.originalPost = entries.originalPost.data.children[0];
          }

          return { data };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to fetch listings';
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: message,
              data: message,
            } satisfies FetchBaseQueryError,
          };
        }
      },

      // Cache by filter only (not pagination) to enable merge across requests
      serializeQueryArgs: ({ queryArgs }) => {
        const filterKey = serializeFilterKey(queryArgs.filters);
        const searchKey = queryArgs.location.search || '';
        return `${filterKey}:${searchKey}`;
      },

      // Merge pagination results
      merge: (currentCache, newData, { arg }) => {
        if (!currentCache) {
          return newData;
        }

        const { pagination } = arg;

        // Prepending new posts (streaming/refresh)
        if (pagination?.before) {
          const newPostCount = Object.keys(newData.children).length;

          // If we got 100 posts (limit), replace everything with fresh data
          if (newPostCount === 100) {
            return {
              ...newData,
              saved: Date.now(),
            };
          }

          // If no new posts, return current cache unchanged
          if (newPostCount === 0) {
            return currentCache;
          }

          // Prepend new posts to existing
          const merged: ListingsData = {
            ...newData,
            after: currentCache.after, // Keep existing after cursor
            children: {
              ...newData.children,
              ...currentCache.children,
            },
            saved: Date.now(),
          };

          // Truncate to conserve memory
          const childKeys = Object.keys(merged.children);
          if (childKeys.length > MAX_POSTS_IN_MEMORY) {
            const keysToKeep = childKeys.slice(0, MAX_POSTS_IN_MEMORY);
            merged.children = Object.fromEntries(
              keysToKeep.map((key) => [key, merged.children[key]])
            );
          }

          return merged;
        }

        // Appending more posts (standard pagination)
        if (pagination?.after) {
          return {
            ...currentCache,
            after: newData.after, // Update after cursor
            children: {
              ...currentCache.children,
              ...newData.children,
            },
            saved: Date.now(),
          };
        }

        // Initial load - replace all
        return {
          ...newData,
          saved: Date.now(),
        };
      },

      forceRefetch: ({ currentArg, previousArg }) => {
        if (!currentArg || !previousArg) {
          return true;
        }

        if (
          serializeFilterKey(currentArg.filters) !==
          serializeFilterKey(previousArg.filters)
        ) {
          return true;
        }

        const currentPagination = currentArg.pagination;
        const previousPagination = previousArg.pagination;

        return (
          currentPagination?.after !== previousPagination?.after ||
          currentPagination?.before !== previousPagination?.before
        );
      },

      providesTags: (_result, _error, arg) => [
        { type: 'Listings', id: 'LIST' },
        { type: 'Listings', id: serializeFilterKey(arg.filters) },
      ],

      keepUnusedDataFor: 60,
    }),

    /**
     * Get subreddit about information
     *
     * Separate query for subreddit metadata (sidebar, rules, etc.)
     * Cached independently with 24-hour retention.
     * Skipped for non-applicable listing types.
     */
    getSubredditAbout: builder.query<
      SubredditData | Record<string, never>,
      GetSubredditAboutArgs
    >({
      async queryFn(args, _api, _extraOptions, _baseQuery) {
        const { subreddit, listType, multi } = args;
        const badTarget = !subreddit || subreddit.match(/mine|popular|friends/);

        // Skip if not applicable
        if ((listType !== 's' && listType !== 'r') || multi || badTarget) {
          return { data: {} };
        }

        try {
          const about = await subredditAbout(subreddit);
          if ('data' in about && 'kind' in about) {
            return { data: about.data };
          }
          return { data: {} };
        } catch (error) {
          console.error(
            `Failed to fetch subreddit about for r/${subreddit}`,
            error
          );
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to fetch subreddit about';
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: message,
              data: message,
            } satisfies FetchBaseQueryError,
          };
        }
      },

      providesTags: (_result, _error, arg) => [
        { type: 'Subreddits', id: arg.subreddit.toLowerCase() },
      ],

      keepUnusedDataFor: 3600 * 24,
    }),
  }),
});

// Export hooks for use in components
export const { useGetListingsQuery, useGetSubredditAboutQuery } = listingsApi;

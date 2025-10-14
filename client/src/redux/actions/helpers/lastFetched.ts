/**
 * Helper functions for tracking last updated timestamps of subreddits
 *
 * These functions implement a smart caching and rate limiting strategy:
 *
 * 1. **Cache Expiration Strategy:**
 *    - Posts < 30 minutes old: Check again at exactly 30 minutes
 *    - Posts < 1 hour old: Check again at exactly 1 hour
 *    - Posts > 1 hour old: Check again in 1 hour
 *
 * 2. **Rate Limiting Strategy (CRITICAL - DO NOT MODIFY):**
 *    - Random delays of 2-5 seconds between requests
 *    - p-limit(5) concurrency control (max 5 simultaneous requests)
 *    - Max 100 subreddits per batch
 *    - These limits prevent Reddit API rate limiting
 *
 * @module lastFetched
 */

import { getListingSubreddit, getListingUser } from '@/reddit/redditApiTs';
import type { Thing, LinkData } from '@/types/redditApi';

/**
 * Entry in the lastUpdated tracking object
 */
export interface LastUpdatedEntry {
  /** Timestamp of the last post (Unix timestamp in seconds) */
  lastPost: number;
  /** Timestamp when this cache entry expires (Unix timestamp in seconds) */
  expires: number;
}

/**
 * Tracking object mapping subreddit/user IDs to their last updated timestamps
 */
export type LastUpdatedTracking = Record<string, LastUpdatedEntry>;

/**
 * Result from fetching last updated timestamp
 */
export interface LastUpdatedResult {
  /** ID of the listing (subreddit or user name) */
  id: string;
  /** Timestamp of the last post (Unix timestamp in seconds) */
  lastPost: number;
}

/**
 * Delay for a random amount of time between minSecs and maxSecs.
 *
 * CRITICAL: This random delay is essential for rate limiting.
 * It prevents all requests from hitting the Reddit API simultaneously.
 * DO NOT REMOVE OR REDUCE THESE DELAYS.
 *
 * @param minSecs - Minimum seconds to delay
 * @param maxSecs - Maximum seconds to delay
 * @returns Promise that resolves after the random delay
 */
export async function randomDelay(
  minSecs: number,
  maxSecs: number
): Promise<void> {
  const minMs = minSecs * 1000;
  const maxMs = maxSecs * 1000;
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
 * Check if a listing should be updated based on cache expiration.
 *
 * @param lastUpdated - LastUpdated tracking object from Redux store
 * @param listingId - Subreddit name or friend name (lowercased)
 * @returns true if the listing should be updated (cache expired or doesn't exist)
 */
export function shouldUpdate(
  lastUpdated: LastUpdatedTracking,
  listingId: string
): boolean {
  const nowSec = Date.now() / 1000;
  const cacheStatus = lastUpdated[listingId];
  return !cacheStatus || nowSec >= cacheStatus.expires;
}

/**
 * Get the first non-pinned post from a listing.
 * Pinned posts are not useful for determining "new post" status.
 *
 * @param entry - Listing response from Reddit API
 * @returns The first non-pinned post, or empty object if none found
 */
function getLastUpdatedEntry(entry: {
  data: { children: Thing<LinkData>[] };
}): Partial<LinkData> {
  let firstNonPinned: Partial<LinkData> = {};

  entry.data.children.some((post) => {
    if (!post.data.pinned) {
      firstNonPinned = post.data;
      return true; // Break out of .some()
    }
    return false;
  });

  return firstNonPinned;
}

/**
 * Calculate when to recheck the last updated post based on post age.
 *
 * Cache Expiration Strategy:
 * - lastPost = 0 (no posts): Expire in 24 hours (empty/private subreddit)
 * - Post < 30 minutes old: Expire at exactly 30 minutes
 * - Post < 1 hour old: Expire at exactly 1 hour
 * - Post > 1 hour old: Expire in 1 hour from now
 *
 * This ensures more frequent checks for active subreddits and less frequent
 * checks for inactive ones.
 *
 * @param lastPost - Unix timestamp (seconds) of the last post, or 0 if no posts
 * @returns Unix timestamp (seconds) when this cache entry should expire
 */
export function getExpiredTime(lastPost: number | undefined): number {
  if (lastPost === undefined) {
    return Date.now() / 1000 + 3600; // Default: expire in 1 hour
  }

  // If lastPost is 0, it means no posts exist (empty/private subreddit)
  // Don't check again for 24 hours to avoid wasting API calls
  if (lastPost === 0) {
    return Date.now() / 1000 + 86400; // Expire in 24 hours
  }

  const nowSec = Date.now() / 1000;
  const timeSinceLastPost = nowSec - lastPost;

  // If the time is below 30 minutes, expire exactly when it hits 30 minutes
  if (timeSinceLastPost < 1800) {
    return lastPost + 1800;
  }

  // If the time is below 1 hour, expire exactly when it hits 1 hour
  if (timeSinceLastPost < 3600) {
    return lastPost + 3600;
  }

  // Otherwise, check again in 1 hour from now
  return nowSec + 3600;
}

/**
 * Fetch the last post for a listing (subreddit or user).
 *
 * @param type - Type of listing ('subreddit' or 'friend')
 * @param path - Subreddit name or username (without /r/ or /user/ prefix)
 * @param id - ID to use in the result (usually the lowercased name)
 * @returns LastUpdatedResult with id and lastPost timestamp, or null if error
 */
export async function getLastUpdated(
  type: 'subreddit' | 'friend',
  path: string,
  id: string
): Promise<LastUpdatedResult | null> {
  try {
    let listing;

    if (type === 'subreddit') {
      listing = await getListingSubreddit(path, 'new', {
        limit: 5,
      });
    } else if (type === 'friend') {
      listing = await getListingUser(path, 'submitted', 'new', {
        limit: 10,
      });
    } else {
      throw new Error(`Unknown listing type: ${type}`);
    }

    // Check if we have any posts
    if (
      listing?.data.children &&
      listing.data.children.length > 0 &&
      typeof listing.data.children[0] === 'object'
    ) {
      const lastUpdatedEntry = getLastUpdatedEntry(listing);

      // Ensure we got a created_utc timestamp
      if (lastUpdatedEntry.created_utc) {
        return {
          id,
          lastPost: lastUpdatedEntry.created_utc,
        };
      }
    }

    // No posts found - return 0 to indicate no posts exist
    // This happens for empty/private subreddits
    // The getDiffClassName function handles lastPost: 0 correctly by not adding any class
    return {
      id,
      lastPost: 0,
    };
  } catch (error: unknown) {
    // Handle errors gracefully to avoid breaking the entire batch
    if (error && typeof error === 'object') {
      const axiosError = error as { name?: string; code?: string };

      // If it's a 400 error, it's probably a private/banned subreddit
      // Return 0 to indicate no accessible posts
      if (
        axiosError.name === 'AxiosError' &&
        axiosError.code === 'ERR_BAD_REQUEST'
      ) {
        console.error('Bad Request (private/banned subreddit?):', {
          type,
          path,
        });
        return {
          id,
          lastPost: 0,
        };
      }
    }

    console.error('Error fetching last updated:', { type, path, error });
    return null; // Continue with other requests even if one fails
  }
}

/**
 * Get the last updated post for a listing with a random delay.
 *
 * CRITICAL: This function implements rate limiting via random delays.
 * The delays are essential to prevent Reddit API rate limiting.
 * DO NOT REMOVE OR REDUCE THE DELAYS.
 *
 * @param type - Type of listing ('subreddit' or 'friend')
 * @param path - Subreddit name or username (without /r/ or /user/ prefix)
 * @param id - ID to use in the result (usually the lowercased name)
 * @param minSecs - Minimum seconds to delay (CRITICAL: Do not reduce below 2)
 * @param maxSecs - Maximum seconds to delay (CRITICAL: Do not reduce below 5)
 * @returns Object ready to merge into lastUpdatedTracking, or null if error
 */
export async function getLastUpdatedWithDelay(
  type: 'subreddit' | 'friend',
  path: string,
  id: string,
  minSecs: number,
  maxSecs: number
): Promise<Record<string, LastUpdatedEntry> | null> {
  // CRITICAL: Random delay for rate limiting
  await randomDelay(minSecs, maxSecs);

  const lastUpdatedDate = await getLastUpdated(type, path, id);

  if (lastUpdatedDate === null) {
    return null;
  }

  const { lastPost } = lastUpdatedDate;
  const expires = getExpiredTime(lastPost);

  // Return in format ready to merge into Redux state
  const toUpdate: Record<string, LastUpdatedEntry> = {};
  toUpdate[id] = {
    lastPost,
    expires,
  };

  return toUpdate;
}

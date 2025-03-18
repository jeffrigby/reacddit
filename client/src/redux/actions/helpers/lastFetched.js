import RedditAPI from '../../../reddit/redditAPI';

/**
 * Delay for a random amount of time between minSecs and maxSecs.
 * @param minSecs {number} minimum seconds to delay
 * @param maxSecs {number} maximum seconds to delay
 * @returns {Promise<unknown>} resolves after delay
 */
export const randomDelay = async (minSecs, maxSecs) => {
  const minMs = minSecs * 1000;
  const maxMs = maxSecs * 1000;
  const delay = Math.floor(Math.random() * maxMs) + minMs;
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

/**
 * Check if the listing should be updated.
 * @param lastUpdated {Object} lastUpdated object from redux store
 * @param listingId {string} subreddit name or friend name
 * @returns {boolean} true if the listing should be updated
 */
export const shouldUpdate = (lastUpdated, listingId) => {
  const nowSec = Date.now() / 1000;
  const cacheStatus = lastUpdated[listingId];
  return !cacheStatus || nowSec >= cacheStatus.expires;
};

function getLastUpdatedEntry(entry) {
  let firstNonPinned = {};
  entry.data.children.some((post) => {
    if (!post.data.pinned) {
      firstNonPinned = post.data;
      return true;
    }
    return false;
  });

  return firstNonPinned;
}

/**
 * Firgure out when to recheck the last updated post.
 * @param lastPost
 * @returns {*}
 */
export const getExpiredTime = (lastPost) => {
  if (lastPost === undefined) {
    return 3600;
  }
  const nowSec = Date.now() / 1000;
  const timeSinceLastPost = nowSec - lastPost;

  // if the time is below 30m. Expire exactly when it hits 30m
  if (timeSinceLastPost < 1800) {
    return lastPost + 1800;
  }

  // if the time is below 1h. Expire exactly when it hits 1h
  if (timeSinceLastPost < 3600) {
    return lastPost + 3600;
  }

  // Otherwise, check every hour.
  return nowSec + 3600;
};

/**
 * Fetch the last post for each listing and return the listingId, lastPost, and expires.
 * @param type {string} 'subreddit' or 'friend'
 * @param path {string} subreddit name or friend name
 * @returns {Promise<{lastPost: *, listingId: *}|null>}
 */
export async function getLastUpdated(type, path, id) {
  try {
    let listing;
    if (type === 'subreddit') {
      listing = await RedditAPI.getListingSubreddit(path, 'new', {
        limit: 5,
      });
    } else if (type === 'friend') {
      listing = await RedditAPI.getListingUser(path, 'submitted', 'new', {
        limit: 10,
      });
    }

    if (typeof listing.data.children[0] === 'object') {
      const lastUpdatedEntry = getLastUpdatedEntry(listing);
      return {
        id,
        lastPost: lastUpdatedEntry.created_utc,
      };
    }

    // console.log('No Posts', { type, path, id });
    return {
      id,
      lastPost: Date.now() + 86400000,
    };
  } catch (error) {
    // If it's a 400 error, it's probably a private subreddit. Don't try again.
    const { name, code } = error;
    if (name === 'AxiosError' && code === 'ERR_BAD_REQUEST') {
      console.error('Bad Request', { type, path });
      return {
        id,
        lastPost: Date.now() + 86400000,
      };
    }

    console.error('Error fetching last updated', { type, path, error });
    return null; // Continue with other requests even if one fails
  }
}

/**
 * Get the last updated post for a listing with a random delay.
 * @param type {string} 'subreddit' or 'friend'
 * @param path {string} subreddit name or friend name
 * @param id {string} subreddit name or friend name
 * @param minSecs {number} minimum seconds to delay
 * @param maxSecs {number} maximum seconds to delay
 * @returns {Promise<{lastPost: number, expires: number}|null>}
 */
export async function getLastUpdatedWithDelay(
  type,
  path,
  id,
  minSecs,
  maxSecs
) {
  await randomDelay(minSecs, maxSecs);
  const lastUpdatedDate = await getLastUpdated(type, path, id);
  if (lastUpdatedDate === null) {
    return null;
  }
  const { lastPost } = lastUpdatedDate;
  const expires = getExpiredTime(lastPost);
  const toUpdate = {};
  toUpdate[id] = {
    lastPost,
    expires,
  };
  return toUpdate;
}

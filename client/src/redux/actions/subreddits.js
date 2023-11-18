import pLimit from 'p-limit';
import RedditAPI from '../../reddit/redditAPI';
import { getLastUpdatedWithDelay, shouldUpdate } from './helpers/lastFetched';

export function subredditsStatus(status, message) {
  return {
    type: 'SUBREDDITS_STATUS',
    status,
    message,
  };
}

export function subredditsFilter(filter) {
  return {
    type: 'SUBREDDITS_FILTER',
    filter,
  };
}

export function subredditsData(subreddits) {
  return {
    type: 'SUBREDDITS_DATA',
    subreddits,
  };
}

export function subredditsLastUpdated(lastUpdated) {
  return {
    type: 'SUBREDDITS_LAST_UPDATED',
    lastUpdated,
  };
}

export function subredditsClearLastUpdated() {
  const clear = true;
  return {
    type: 'SUBREDDITS_LAST_UPDATED_CLEAR',
    clear,
  };
}

let subredditsFetchLastUpdatedRunning = false;
/**
 * Fetch the last post for each subreddit and recheck based on when
 * it was last updated.
 * @returns {Function}
 */
export function subredditsFetchLastUpdated() {
  return async (dispatch, getState) => {
    try {
      if (subredditsFetchLastUpdatedRunning) {
        return;
      }
      subredditsFetchLastUpdatedRunning = true;
      const currentState = getState();
      const { subreddits } = currentState.subreddits;
      const { friends } = currentState.redditFriends;
      const { lastUpdated } = currentState;

      // Create subreddit requests
      const lookups = [];
      Object.entries(subreddits).forEach(([key, subreddit]) => {
        if (shouldUpdate(lastUpdated, subreddit.name)) {
          // Check if it's a subreddit or a user
          if (subreddit.url.match(/^\/user\//)) {
            lookups.push({
              type: 'friend',
              path: subreddit.url.replace(/^\/user\/|\/$/g, ''),
              id: subreddit.name,
            });
            return;
          }

          lookups.push({
            type: 'subreddit',
            path: subreddit.url.replace(/^\/r\/|\/$/g, ''),
            id: subreddit.name,
          });
        }
      });

      // Create friends
      Object.entries(friends).forEach(([key, friend]) => {
        if (shouldUpdate(lastUpdated, friend.id)) {
          lookups.push({ type: 'friend', path: friend.name, id: friend.id });
        }
      });

      const fetchWithDelay = async (lookup) => {
        const { type, path, id } = lookup;
        const toUpdate = await getLastUpdatedWithDelay(type, path, id, 2, 5);
        dispatch(subredditsLastUpdated(toUpdate));
      };

      const limit = pLimit(5);
      const max = 100;
      // Limit to max amount
      const maxLookups = lookups.slice(0, max);
      const fetchPromises = maxLookups.map((lookup) =>
        limit(() => fetchWithDelay(lookup))
      );

      await Promise.all(fetchPromises);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error fetching last updated', e);
    } finally {
      subredditsFetchLastUpdatedRunning = false;
    }
  };
}

/**
 * Map the post children ids to the keys.
 * @param children
 * @returns {*}
 */
const mapSubreddits = (children) =>
  Object.entries(children)
    .map(([key, value]) => value.data)
    .reduce((ac, s) => ({ ...ac, [s.display_name.toLowerCase()]: s }), {});

/**
 * Fetch all the subreddits and concat them together
 * This is because of the 100 sub limit.
 * @param where
 * @param options
 * @returns {Promise<void>}
 */
const subredditsAll = async (where, options) => {
  let init = true;
  let qsAfter = null;
  let srs = null;
  let subreddits = {};

  // console.log('uncached');

  const newOptions = options || {};

  /* eslint-disable no-await-in-loop */
  while (init || qsAfter) {
    init = false;
    newOptions.after = qsAfter;
    srs = await RedditAPI.subreddits(where, newOptions);
    const mapped = mapSubreddits(srs.data.children);
    subreddits = { ...mapped, ...subreddits };
    qsAfter = srs.data.after || null;
  }

  return subreddits;
};

/**
 * Fetch the subreddits from the cache first or from reddit directly
 * @param reset - ignore the cache
 * @param where - what kind of subreddits to fetch This is useless
 *  right now. Keyed to subscriber.
 *    subscriber - subreddits the user is subscribed to
 *    contributor - subreddits the user is an approved submitter in
 *    moderator - subreddits the user is a moderator of
 *    streams - subscribed to subreddits that contain hosted video links
 * @returns {Function}
 */
export function subredditsFetchData(reset, where = 'subscriber') {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();

      // Look for the cache.
      if (
        currentState.subreddits !== undefined &&
        !reset &&
        currentState.subreddits.status === 'loaded'
      ) {
        // Cache for one day
        const subExpired =
          Date.now() > currentState.subreddits.lastUpdated + 3600 * 24 * 1000;
        if (currentState.subreddits.status === 'loaded' && !subExpired) {
          dispatch(subredditsFetchLastUpdated());
          return;
        }
      }

      // Not cached.
      dispatch(subredditsStatus('loading'));
      const subreddits = await subredditsAll(where, {});
      const lastUpdated = Date.now();
      const storeSubs = {
        status: 'loaded',
        subreddits,
        lastUpdated,
      };
      await dispatch(subredditsData(storeSubs));
      dispatch(subredditsFetchLastUpdated());
    } catch (e) {
      dispatch(subredditsStatus('error', e.toString()));
    }
  };
}

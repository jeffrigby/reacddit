import axios from 'axios';
import RedditAPI from '../../reddit/redditAPI';

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

/**
 * Firgure out when to recheck the last updated post.
 * @param lastPost
 * @returns {*}
 */
const getExpiredTime = (lastPost) => {
  if (lastPost === undefined) return 3600;
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
 * Fetch the last post for each subreddit and recheck based on when
 * it was last updated.
 * @returns {Function}
 */
export function subredditsFetchLastUpdated() {
  return (dispatch, getState) => {
    const currentState = getState();
    const { subreddits } = currentState.subreddits;
    const nowSec = Date.now() / 1000;

    const createdToGet = [];
    Object.entries(subreddits).forEach(([key, value]) => {
      // @todo convert to API? Concerned about rate limit.
      // Limit is 2 because it occasionally returns nothing when the limit is 1. No idea why.
      const url = `https://www.reddit.com${value.url}new.json?limit=2`;

      // look for cache
      const lastUpdated = currentState.lastUpdated[value.name];
      if (lastUpdated) {
        const { expires } = lastUpdated;
        const expired = nowSec >= expires;
        if (expired) {
          createdToGet.push(axios.get(url).catch(() => null));
        }
      } else {
        createdToGet.push(axios.get(url).catch(() => null));
      }
    });

    // Nothing to update
    if (createdToGet.length === 0) {
      return;
    }

    // Do 50 at a time.
    const chunks = [];
    while (createdToGet.length) {
      chunks.push(createdToGet.splice(0, 50));
    }

    // Loop through them and create an object to insert.
    chunks.forEach(async (value) => {
      try {
        const results = await axios
          .all(value)
          .then(axios.spread((...args) => args));

        const toUpdate = {};
        results.forEach((item) => {
          const entry = item.data;
          // process item
          if (typeof entry.data.children[0] === 'object') {
            const lastPost = entry.data.children[0].data.created_utc;
            const subredditId = entry.data.children[0].data.subreddit_id;
            const expires = getExpiredTime(lastPost);
            toUpdate[subredditId] = {
              lastPost,
              expires,
            };
          }
        });

        dispatch(subredditsLastUpdated(toUpdate));
      } catch (e) {
        // console.log(e);
      }
    });
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

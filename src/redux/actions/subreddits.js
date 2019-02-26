import axios from 'axios';
import RedditHelpers from '../../reddit/redditHelpers';

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

export function subredditsFetchDataSuccess(subreddits) {
  return {
    type: 'SUBREDDITS_FETCH_DATA_SUCCESS',
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

const getExpiredTime = lastPost => {
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

export function subredditsFetchLastUpdated() {
  return (dispatch, getState) => {
    const currentState = getState();
    const { subreddits } = currentState.subreddits;
    const nowSec = Date.now() / 1000;

    const createdToGet = [];
    Object.entries(subreddits).forEach(([key, value]) => {
      // @todo convert to API? Concerned about rate limit.
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
    chunks.forEach(async value => {
      const results = await axios
        .all(value)
        .then(axios.spread((...args) => args));

      const toUpdate = {};
      results.forEach(item => {
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
    });
  };
}

export function subredditsFetchData(reset, where) {
  return async dispatch => {
    dispatch(subredditsStatus('loading'));
    try {
      const subs = await RedditHelpers.subredditsAll(where, {}, reset);
      await dispatch(subredditsFetchDataSuccess(subs.subreddits));
      dispatch(subredditsFetchLastUpdated());
    } catch (e) {
      dispatch(subredditsStatus('error', e.toString()));
    }
  };
}

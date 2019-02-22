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

export function subredditsLastUpdatedTime(lastUpdatedTime) {
  return {
    type: 'SUBREDDITS_LAST_UPDATED_TIME',
    lastUpdatedTime,
  };
}

export function subredditsFetchLastUpdated(subreddits, lastUpdated = {}) {
  return (dispatch, getState) => {
    const now = Date.now();
    const currentState = getState();
    const { lastUpdatedTime } = currentState;
    const modifyLastUpdated = { ...lastUpdated };

    // Check if these resuls are expired, default to 15
    // @todo make this configurable in dotenv
    const timeSinceCached = now - lastUpdatedTime;
    const cacheExpired = timeSinceCached >= 15 * 60 * 1000;

    const createdToGet = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const value = subreddits[key];
        if (!cacheExpired && currentState.lastUpdated[value.name]) {
          // Get the cached version.
          modifyLastUpdated[value.name] = currentState.lastUpdated[value.name];
          return;
        }
        if (value.url !== '/r/mine' && value.quarantine === false) {
          const url = `https://www.reddit.com${value.url}new.json?limit=2`;
          createdToGet.push(axios.get(url).catch(() => null));
        }
      }
    });

    // Don't do anything if there's no new data
    if (createdToGet.length === 0) {
      return;
    }

    // @todo move this to common
    const chunks = [];
    while (createdToGet.length) {
      chunks.push(createdToGet.splice(0, 50));
    }

    chunks.forEach(async value => {
      const results = await axios
        .all(value)
        .then(axios.spread((...args) => args));
      // const newLastUpdated = lastUpdated;
      results.forEach(item => {
        const entry = item.data;
        // process item
        if (typeof entry.data.children[0] === 'object') {
          const created = entry.data.children[0].data.created_utc;
          const subredditId = entry.data.children[0].data.subreddit_id;
          modifyLastUpdated[subredditId] = created;
        }
      });
      dispatch(subredditsLastUpdated(modifyLastUpdated));
    });
    const updateTime = Date.now();
    dispatch(subredditsLastUpdatedTime(updateTime));
  };
}

export function subredditsFetchData(reset, where) {
  return async dispatch => {
    dispatch(subredditsStatus('loading'));
    try {
      const subs = await RedditHelpers.subredditsAll(where, {}, reset);
      await dispatch(subredditsFetchDataSuccess(subs.subreddits));
      dispatch(subredditsFetchLastUpdated(subs.subreddits));
    } catch (e) {
      dispatch(subredditsStatus('error', e.toString()));
    }
  };
}

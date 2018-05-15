import axios from 'axios';
import RedditHelpers from '../../reddit/redditHelpers';


export function subredditsStatus(status, message) {
  return {
    type: 'SUBREDDITS_STATUS',
    status,
    message,
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

export function subredditsFetchLastUpdated(subreddits, lastUpdated = {}) {
  return (dispatch) => {
    const createdToGet = [];
    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const value = subreddits[key];
        if (value.url !== '/r/mine' && value.quarantine === false) {
          const url = `https://www.reddit.com${value.url}new.json?limit=1&sort=new`;
          // createdToGet.push(url);
          createdToGet.push(axios.get(url).catch(() => null));
        }
      }
    });

    // @todo move this to common
    const chunks = [];
    while (createdToGet.length) {
      chunks.push(createdToGet.splice(0, 50));
    }

    chunks.forEach(async (value) => {
      const results = await axios.all(value).then(axios.spread((...args) => args));
      const newLastUpdated = lastUpdated;
      results.forEach((item) => {
        const entry = item.data;
        // process item
        if (typeof entry.data.children[0] === 'object') {
          const created = entry.data.children[0].data.created_utc;
          const subredditId = entry.data.children[0].data.subreddit_id;
          newLastUpdated[subredditId] = created;
        }
      });
      dispatch(subredditsLastUpdated(newLastUpdated));
    });
  };
}

export function subredditsFetchDefaultData() {
  const url = 'https://www.reddit.com/subreddits/default.json?limit=100';
  return async (dispatch) => {
    dispatch(subredditsStatus('loading'));
    try {
      const subredditsGet = await axios.get(url);
      const subreditObj = subredditsGet.data.data.children;

      // @todo better way to do this?
      const subreddits = [];
      Object.keys(subreditObj).forEach((key, index) => {
        if (Object.prototype.hasOwnProperty.call(subreditObj, key)) {
          subreddits.push(subreditObj[key].data);
        }
      });

      subreddits.sort((a, b) => {
        if (a.display_name.toLowerCase() < b.display_name.toLowerCase()) return -1;
        if (a.display_name.toLowerCase() > b.display_name.toLowerCase()) return 1;
        return 0;
      });

      // convert it back to an object
      const subredditsKey = {};
      subreddits.forEach((item) => {
        subredditsKey[item.display_name] = item;
      });

      await dispatch(subredditsFetchDataSuccess(subredditsKey));
      dispatch(subredditsFetchLastUpdated(subreddits));
    } catch (e) {
      dispatch(subredditsStatus('error', e.toString()));
    }
  };
}

export function subredditsFetchData(reset) {
  return async (dispatch) => {
    dispatch(subredditsStatus('loading'));
    try {
      const subs = await RedditHelpers.subredditMineAll('subscriber', {}, reset);
      await dispatch(subredditsFetchDataSuccess(subs.subreddits));
      dispatch(subredditsFetchLastUpdated(subs.subreddits));
    } catch (e) {
      dispatch(subredditsStatus('error', e.toString()));
    }
  };
}


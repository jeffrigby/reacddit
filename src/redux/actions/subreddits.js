import Promise from 'es6-promise';

require('es6-promise').polyfill();
require('isomorphic-fetch');

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
    const runUpdate = (urls) => {
      Promise.all(urls)
        .then((results) => {
          const newLastUpdated = lastUpdated;
          // we only get here if ALL promises fulfill
          results.forEach((item) => {
            // process item
            if (typeof item.data.children[0] === 'object') {
              const created = item.data.children[0].data.created_utc;
              const subredditId = item.data.children[0].data.subreddit_id;
              newLastUpdated[subredditId] = created;
            }
          });
          return newLastUpdated;
        })
        .then(lastUpdatedRes => dispatch(subredditsLastUpdated(lastUpdatedRes)))
        .catch(() => {
          // console.log('Failed:', err);
          // Add some error shit here.
        });
    };

    const urls = [];
    let i = 0;

    Object.keys(subreddits).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subreddits, key)) {
        const value = subreddits[key];
        if (value.url !== '/r/mine' && value.quarantine === false) {
          const url = `https://www.reddit.com${value.url}new.json?limit=1&sort=new`;
          urls.push(
            new Promise((resolve, reject) => {
              fetch(url).then(response => resolve(response.json())).catch(e => reject(e));
            }));
          i += 1;
          if (i >= 50) {
            runUpdate(urls);
            i = 0;
            urls.length = 0;
          }
        }
      }
    });

    if (urls.length > 0) {
      runUpdate(urls);
    }
  };
}

export function subredditsFetchDefaultData() {
  const url = 'https://www.reddit.com/subreddits/default.json?limit=100';
  return (dispatch) => {
    dispatch(subredditsStatus('loading'));
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        dispatch(subredditsStatus('loaded'));
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        const subreditObj = json.data.children;
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

        dispatch(subredditsFetchDataSuccess(subredditsKey));
        return subreddits;
      })
      .then(subreddits => dispatch(subredditsFetchLastUpdated(subreddits)))
      .catch((e) => {
        dispatch(subredditsStatus('error', e.toString()));
      });
  };
}

export function subredditsFetchData(reset) {
  return (dispatch) => {
    let url = '/json/subreddits/lean';
    if (reset === true) {
      url += '/true';
    }
    dispatch(subredditsStatus('loading'));

    fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        const subreddits = json.subreddits;
        const subredditsKey = {};
        subreddits.forEach((item) => {
          subredditsKey[item.display_name] = item;
        });

        dispatch(subredditsFetchDataSuccess(subredditsKey));
        return subredditsKey;
      })
      .then(subreddits => dispatch(subredditsFetchLastUpdated(subreddits)))
      .catch((e) => {
        dispatch(subredditsStatus('error', e.toString()));
      });
  };
}


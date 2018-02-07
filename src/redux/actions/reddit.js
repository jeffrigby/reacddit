import axios from 'axios';
// import update from 'immutability-helper';

export function redditMultiReddits(multiReddits) {
  return {
    type: 'REDDIT_MUTLI_REDDITS',
    multiReddits,
  };
}

export function redditAuthInfoFetch() {
  return {
    types: ['LOAD', 'REDDIT_AUTH_INFO'],
    payload: {
      request: {
        url: '/json/accessToken',
      },
    },
  };
}

export function redditRefreshAuth() {
  return async (dispatch, getState) => {
    const currentState = getState();
    // const expires = ldget(currentState, 'redditAuthInfo.accessToken.expires');
    const { expires } = currentState.redditAuthInfo.accessToken;
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    if (expires && expires <= timestamp) {
      await dispatch(redditAuthInfoFetch());
    }
    const newState = getState();
    const { accessToken } = newState.redditAuthInfo.accessToken;
    if (accessToken) {
      return Promise.resolve(accessToken);
    }
    return Promise.resolve(null);
  };
}

export function redditFetchMultis() {
  return async (dispatch, getState) => {
    const token = await dispatch(redditRefreshAuth());
    if (token) {
      const config = { headers: { Authorization: `bearer ${token}` } };
      try {
        const multis = await axios.get('https://oauth.reddit.com/api/multi/mine', config);
        const result = {
          multis: multis.data,
          status: 'loaded',
        };
        dispatch(redditMultiReddits(result));
      } catch (e) {
        dispatch(redditMultiReddits({ status: 'error', error: e.toString() }));
      }
    }
  };
}

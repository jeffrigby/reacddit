// import axios from 'axios';
// import update from 'immutability-helper';

export function redditMultiReddits() {
  return {
    types: ['LOAD', 'REDDIT_MUTLI_REDDITS'],
    payload: {
      request: {
        url: '/json/accessToken',
      },
    },
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

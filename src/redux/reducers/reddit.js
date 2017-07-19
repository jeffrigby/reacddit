export function redditAuthInfo(state = { }, action) {
  switch (action.type) {
    case 'REDDIT_AUTH_INFO': {
      const loaded = Object.assign({}, action.payload.data, { status: 'loaded' });
      return loaded;
    }
    default:
      return state;
  }
}

export function redditMultiReddits(state = { }, action) {
  switch (action.type) {
    case 'REDDIT_MUTLI_REDDITS':
      return action.payload.data;

    default:
      return state;
  }
}

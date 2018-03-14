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

export function redditMultiReddits(state = { status: 'unloaded', subreddits: {} }, action) {
  switch (action.type) {
    case 'REDDIT_MUTLI_REDDITS':
      return action.multiReddits;

    default:
      return state;
  }
}

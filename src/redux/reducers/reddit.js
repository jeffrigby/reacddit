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

export function redditMultiReddits(state = { status: 'unloaded' }, action) {
  switch (action.type) {
    case 'REDDIT_MUTLI_REDDITS':
      return action.multiReddits;

    default:
      return state;
  }
}

export function redditMe(state = { status: 'unloaded', me: {} }, action) {
  switch (action.type) {
    case 'REDDIT_ME':
      return action.me;

    default:
      return state;
  }
}

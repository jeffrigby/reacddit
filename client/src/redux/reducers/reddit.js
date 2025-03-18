export function redditMultiReddits(state = { status: 'unloaded' }, action) {
  switch (action.type) {
    case 'REDDIT_MUTLI_REDDITS':
      return action.multiReddits;

    default:
      return state;
  }
}

export function redditBearer(
  state = { status: 'unloaded', bearer: null },
  action
) {
  switch (action.type) {
    case 'REDDIT_BEARER':
      return action.bearer;

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

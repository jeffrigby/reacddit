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

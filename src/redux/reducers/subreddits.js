export function subreddits(state = { status: 'unloaded', subreddits: {} }, action) {
  switch (action.type) {
    case 'SUBREDDITS_STATUS':
      return {
        status: action.status,
        message: action.message,
      };
    case 'SUBREDDITS_FETCH_DATA_SUCCESS': {
      const successState = {
        status: 'loaded',
        subreddits: action.subreddits,
      };
      return successState;
    }
    default:
      return state;
  }
}

export function lastUpdated(state = {}, action) {
  switch (action.type) {
    case 'SUBREDDITS_LAST_UPDATED':
      return Object.assign({}, action.lastUpdated);
    default:
      return state;
  }
}

export function subreddits(
  state = { status: 'unloaded', subreddits: {} },
  action
) {
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

export function lastUpdatedTime(state = 0, action) {
  switch (action.type) {
    case 'SUBREDDITS_LAST_UPDATED_TIME':
      return action.lastUpdatedTime;
    default:
      return state;
  }
}

export function subredditsFilter(state = '', action) {
  switch (action.type) {
    case 'SUBREDDITS_FILTER':
      return action.filter;

    default:
      return state;
  }
}

export function subredditsFilterActive(state = false, action) {
  switch (action.type) {
    case 'SUBREDDITS_FILTER_ACTIVE':
      return action.active;

    default:
      return state;
  }
}

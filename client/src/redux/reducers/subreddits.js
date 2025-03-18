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
    case 'SUBREDDITS_DATA': {
      // sort subs before storing them.
      const oldSubs = { ...action.subreddits };
      const subredditsOrdered = {};
      Object.keys(oldSubs.subreddits)
        .sort()
        .forEach((key) => {
          subredditsOrdered[key] = oldSubs.subreddits[key];
        });

      return {
        ...oldSubs,
        subreddits: subredditsOrdered,
      };
    }
    default:
      return state;
  }
}

export function lastUpdated(state = {}, action) {
  switch (action.type) {
    case 'SUBREDDITS_LAST_UPDATED_CLEAR':
      return {};
    case 'SUBREDDITS_LAST_UPDATED':
      return {
        ...state,
        ...action.lastUpdated,
      };
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

export function subredditsFilter(
  state = { filterText: '', active: false, activeIndex: 0 },
  action
) {
  switch (action.type) {
    case 'SUBREDDITS_FILTER':
      return {
        ...state,
        ...action.filter,
      };

    default:
      return state;
  }
}

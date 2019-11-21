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
      const subredditsOrdered = {};
      Object.keys(action.subreddits.subreddits)
        .sort()
        .forEach(key => {
          subredditsOrdered[key] = action.subreddits.subreddits[key];
        });

      const sortedList = {
        ...action.subreddits,
        subreddits: subredditsOrdered,
      };

      return sortedList;
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

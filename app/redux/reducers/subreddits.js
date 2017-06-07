export function subredditsHasErrored(state = false, action) {
  switch (action.type) {
    case 'SUBREDDITS_HAS_ERRORED':
      return action.hasErrored;

    default:
      return state;
  }
}

export function subredditsIsLoading(state = true, action) {
  switch (action.type) {
    case 'SUBREDDITS_IS_LOADING':
      return action.isLoading;

    default:
      return state;
  }
}

export function subreddits(state = {}, action) {
  switch (action.type) {
    case 'SUBREDDITS_FETCH_DATA_SUCCESS':
      return action.subreddits;
    default:
      return state;
  }
}

export function subredditsCurrent(state = '', action) {
  switch (action.type) {
    case 'SUBREDDITS_CURRENT_SUBREDDIT':
      return action.subreddit;
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

export function subredditsFilter(state = '', action) {
  switch (action.type) {
    case 'SUBREDDITS_FILTER':
      return action.filter;
    default:
      return state;
  }
}

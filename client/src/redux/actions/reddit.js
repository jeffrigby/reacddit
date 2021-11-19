import RedditAPI from '../../reddit/redditAPI';

export function redditMultiReddits(multiReddits) {
  return {
    type: 'REDDIT_MUTLI_REDDITS',
    multiReddits,
  };
}

export function redditMe(me) {
  return {
    type: 'REDDIT_ME',
    me,
  };
}

export function redditBearer(bearer) {
  return {
    type: 'REDDIT_BEARER',
    bearer,
  };
}

export function redditFriends(friends) {
  return {
    type: 'REDDIT_FRIENDS',
    friends,
  };
}

export function redditGetBearer() {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();
      const bearer = await RedditAPI.getToken(false);
      const status =
        bearer === null || bearer.substr(0, 1) === '-' ? 'anon' : 'auth';

      const loginURL = RedditAPI.getLoginUrl();

      const result = {
        bearer,
        status,
        loginURL,
      };

      const currentRedditBearer = currentState.redditBearer;
      if (currentRedditBearer.bearer !== bearer) {
        dispatch(redditBearer(result));
      }
      return bearer;
    } catch (e) {
      dispatch(redditBearer({ status: 'error', error: e.toString() }));
    }
    return null;
  };
}

export function redditFetchMe(reset) {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();
      const isAuth = currentState.redditBearer.status === 'auth' || false;

      if (currentState.redditMe !== undefined) {
        // Cache anon for a day.
        const anonExpired =
          Date.now() > currentState.redditMe.lastUpdated + 3600 * 24 * 1000;
        if (
          currentState.redditMe.status === 'loaded' &&
          !reset &&
          !isAuth &&
          !anonExpired
        ) {
          return;
        }

        // Cache the auth user profile for as long as the bearer matches (1 hour max)
        if (
          isAuth &&
          !reset &&
          currentState.redditMe.id === currentState.redditBearer.bearer
        ) {
          return;
        }
      }

      const me = await RedditAPI.me();
      const lastUpdated = Date.now();
      const result = {
        me,
        status: 'loaded',
        lastUpdated,
        id: currentState.redditBearer.bearer,
      };
      dispatch(redditMe(result));
    } catch (e) {
      dispatch(redditMe({ status: 'error', error: e.toString() }));
    }
  };
}

/**
 * Fetch friends from reddit API
 * @param reset
 * @returns {function(*, *): Promise<undefined>}
 */
export function redditFetchFriends(reset = false) {
  return async (dispatch, getState) => {
    const currentState = getState();

    // Check for cache first. If it exists, do nothing.
    if (currentState.redditFriends !== undefined && !reset) {
      const friendsExpired =
        Date.now() > currentState.redditFriends.lastUpdated + 3600 * 24 * 1000;
      if (currentState.redditFriends.status === 'loaded' && !friendsExpired) {
        return;
      }
    }

    const friendsRequest = await RedditAPI.friends();
    if (friendsRequest.status !== 200) {
      dispatch(
        redditFriends({
          status: 'error',
          lastUpdated: 0,
          friends: {},
          response: friendsRequest,
        })
      );
      return;
    }

    const { children } = friendsRequest.data.data;

    if (children.length === 0) {
      dispatch(
        redditFriends({
          status: 'loaded',
          lastUpdated: Date.now(),
          friends: {},
        })
      );
      return;
    }

    const friendsKeyed = {};
    const childrenSorted = children.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );
    childrenSorted.forEach((friend) => {
      friendsKeyed[friend.name.toLowerCase()] = friend;
    });

    dispatch(
      redditFriends({
        status: 'loaded',
        lastUpdated: Date.now(),
        friends: friendsKeyed,
      })
    );
  };
}

export function redditFetchMultis(reset) {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();
      if (currentState.redditMultiReddits !== undefined && !reset) {
        const multiExpired =
          Date.now() >
          currentState.redditMultiReddits.lastUpdated + 3600 * 24 * 1000;
        if (
          currentState.redditMultiReddits.status === 'loaded' &&
          !multiExpired
        ) {
          return;
        }
      }
      const multis = await RedditAPI.multiMine({ expand_srs: true });
      const lastUpdated = Date.now();

      const result = {
        multis,
        status: 'loaded',
        lastUpdated,
      };
      dispatch(redditMultiReddits(result));
    } catch (e) {
      dispatch(redditMultiReddits({ status: 'error', error: e.toString() }));
    }
  };
}

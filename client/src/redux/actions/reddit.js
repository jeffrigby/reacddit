import RedditAPI from '../../reddit/redditAPI';
import { getLoginUrl, getToken, me } from '../../reddit/redditApiTs';

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

export function redditGetBearer() {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();
      const { token, cookieTokenParsed } = await getToken(false);
      const { auth } = cookieTokenParsed;

      // const status =
      //   bearer === null || bearer.substr(0, 1) === '-' ? 'anon' : 'auth';

      const loginURL = getLoginUrl();

      const result = {
        bearer: token,
        status: auth ? 'auth' : 'anon',
        loginURL,
      };

      const currentRedditBearer = currentState.redditBearer;
      if (currentRedditBearer.bearer !== token) {
        dispatch(redditBearer(result));
      }
      return token;
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

      const meResp = await me();
      const lastUpdated = Date.now();
      const result = {
        me: meResp,
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

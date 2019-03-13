import { listingsEntryUpdate } from './listings';
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

export function redditGetBearer() {
  return async (dispatch, getState) => {
    try {
      const currentState = getState();
      const bearer = await RedditAPI.getToken(false);
      const status =
        bearer === null || bearer.substr(0, 1) === '-' ? 'anon' : 'auth';
      const result = {
        bearer,
        status,
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

export function redditSave(id) {
  return async (dispatch, getState) => {
    const token = await RedditAPI.getToken(false);
    if (token) {
      await RedditAPI.save(id);
      const updatedEntry = {
        name: id,
        saved: true,
      };
      dispatch(listingsEntryUpdate(updatedEntry));
    }
  };
}

export function redditUnsave(id) {
  return async (dispatch, getState) => {
    const token = await RedditAPI.getToken(false);
    if (token) {
      await RedditAPI.unsave(id);
      const updatedEntry = {
        name: id,
        saved: false,
      };
      dispatch(listingsEntryUpdate(updatedEntry));
    }
  };
}

export function redditVote(id, dir) {
  return async (dispatch, getState) => {
    const currentState = getState();
    const token = await RedditAPI.getToken(false);
    if (token) {
      try {
        let { likes, ups } = currentState.listingsRedditEntries.children[
          id
        ].data;
        await RedditAPI.vote(id, dir);

        switch (dir) {
          case 1:
            switch (likes) {
              case true:
                break;
              case false:
                ups += 2;
                break;
              default:
                ups += 1;
                break;
            }
            likes = true;
            break;
          case -1:
            switch (likes) {
              case true:
                ups -= 2;
                break;
              case false:
                break;
              default:
                ups -= 1;
                break;
            }
            likes = false;
            break;
          case 0:
            switch (likes) {
              case true:
                ups -= 1;
                break;
              case false:
                ups += 1;
                break;
              default:
                break;
            }
            likes = null;
            break;
          default:
            break;
        }

        const updatedEntry = {
          name: id,
          ups,
          likes,
        };

        dispatch(listingsEntryUpdate(updatedEntry));
      } catch (e) {
        // console.log(e);
      }
    }
  };
}

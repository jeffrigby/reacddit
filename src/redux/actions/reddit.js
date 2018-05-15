import { listingsEntryUpdate } from './listings';
import RedditHelpers from '../../reddit/redditHelpers';

const Snoowrap = require('snoowrap');

export function redditMultiReddits(multiReddits) {
  return {
    type: 'REDDIT_MUTLI_REDDITS',
    multiReddits,
  };
}

export function redditAuthInfoFetch() {
  return {
    types: ['LOAD', 'REDDIT_AUTH_INFO'],
    payload: {
      request: {
        url: '/json/accessToken',
      },
    },
  };
}

export function redditRefreshAuth() {
  return async (dispatch, getState) => {
    const currentState = getState();
    const { expires } = currentState.redditAuthInfo.accessToken;
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    if (expires && expires <= timestamp) {
      await dispatch(redditAuthInfoFetch());
    }
    const newState = getState();
    const { accessToken } = newState.redditAuthInfo.accessToken;
    if (accessToken) {
      return Promise.resolve(accessToken);
    }
    return Promise.resolve(null);
  };
}

export function redditFetchMultis(reset) {
  return async (dispatch, getState) => {
    try {
      const multis = await RedditHelpers.multiMine({}, reset);
      console.log(multis);
      const result = {
        multis: multis.data,
        status: 'loaded',
      };
      console.log(result);
      dispatch(redditMultiReddits(result));
    } catch (e) {
      dispatch(redditMultiReddits({ status: 'error', error: e.toString() }));
    }
  };
}

export function redditVote(id, dir) {
  return async (dispatch, getState) => {
    const currentState = getState();
    const token = await dispatch(redditRefreshAuth());
    if (token) {
      const r = new Snoowrap({ accessToken: token });

      try {
        const sub = r.getSubmission(id);
        let { likes, ups } = currentState.listingsEntries.entries[id];

        switch (dir) {
          case 1:
            await sub.upvote();
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
            await sub.downvote();
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
            await sub.unvote();
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

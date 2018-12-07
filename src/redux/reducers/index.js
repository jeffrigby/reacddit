import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { subreddits, lastUpdated, lastUpdatedTime } from './subreddits';
import * as listings from './listings';
import * as reddit from './reddit';
import * as auth from './auth';

const hardCoded = {
  subreddits,
  lastUpdated,
  lastUpdatedTime,
};

export default history =>
  combineReducers({
    router: connectRouter(history),
    ...hardCoded,
    ...listings,
    ...reddit,
    ...auth,
  });

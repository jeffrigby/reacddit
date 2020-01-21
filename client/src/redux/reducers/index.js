import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import * as subreddits from './subreddits';
import * as listings from './listings';
import * as reddit from './reddit';
import * as misc from './misc';

export default history =>
  combineReducers({
    router: connectRouter(history),
    ...subreddits,
    ...listings,
    ...reddit,
    ...misc,
  });

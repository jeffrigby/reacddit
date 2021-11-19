import { combineReducers } from 'redux';
import * as subreddits from './subreddits';
import * as listings from './listings';
import * as reddit from './reddit';
import * as misc from './misc';

export default () =>
  combineReducers({
    ...subreddits,
    ...listings,
    ...reddit,
    ...misc,
  });

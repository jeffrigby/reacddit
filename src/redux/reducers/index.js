import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { subreddits, lastUpdated } from './subreddits';
import * as listings from './listings';
import * as reddit from './reddit';
import * as auth from './auth';

const hardCoded = {
  subreddits,
  lastUpdated,
  router: routerReducer,
};

const combined = Object.assign({}, hardCoded, listings, reddit, auth);

const rootReducer = combineReducers(combined);

export default rootReducer;
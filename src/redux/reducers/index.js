import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { subreddits, subredditsHasErrored, subredditsIsLoading, lastUpdated, subredditsFilter, subredditsCurrent } from './subreddits';
import * as listings from './listings';
// import { authInfo } from './auth';

const hardCoded = {
  subreddits,
  lastUpdated,
  subredditsHasErrored,
  subredditsIsLoading,
  subredditsFilter,
  subredditsCurrent,
  listings,
  // authInfo,
  router: routerReducer,
};

const combined = Object.assign({}, hardCoded, listings);

const rootReducer = combineReducers(combined);

export default rootReducer;

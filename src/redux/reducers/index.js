import { applyMiddleware, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { subreddits, subredditsHasErrored, subredditsIsLoading, lastUpdated, subredditsFilter, subredditsCurrent } from './subreddits';
import * as listings from './listings';
import * as auth from './auth';

// Apply Middlewares
const middleware = [];
middleware.push(thunk);
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger());
}

const hardCoded = {
  subreddits,
  lastUpdated,
  subredditsHasErrored,
  subredditsIsLoading,
  subredditsFilter,
  subredditsCurrent,
  router: routerReducer,
};

const combined = Object.assign({}, hardCoded, listings, auth, applyMiddleware(...middleware));

const rootReducer = combineReducers(combined);

export default rootReducer;

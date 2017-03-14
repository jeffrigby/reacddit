import { combineReducers } from 'redux';
import { subreddits, subredditsHasErrored, subredditsIsLoading, lastUpdated, subredditsFilter, subredditsCurrent } from './subreddits';
import { listingsSort, listingsSortTop, listingsTarget, listingsListType } from './listings';
import { authInfo } from './auth';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
    subreddits,
    lastUpdated,
    subredditsHasErrored,
    subredditsIsLoading,
    subredditsFilter,
    subredditsCurrent,
    listingsSort,
    listingsSortTop,
    listingsTarget,
    listingsListType,
    authInfo,
    routing: routerReducer
});

export default rootReducer;

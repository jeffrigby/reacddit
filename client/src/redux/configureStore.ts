import { configureStore } from '@reduxjs/toolkit';
import listingsReducer from './slices/listingsSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import historyReducer from './slices/historySlice';
import subredditsReducer from './slices/subredditsSlice';
import multiRedditsReducer from './slices/multiRedditsSlice';
import bearerReducer from './slices/redditBearerSlice';
import meReducer from './slices/redditMeSlice';
import { redditApiReducer, redditApiMiddleware } from './api';

/**
 * Configure the Redux store with all slice reducers
 * Following Redux Toolkit best practices:
 * - Single store instance
 * - Automatic Redux DevTools integration
 * - Automatic redux-thunk middleware
 * - Development-mode checks for mutations and serializability
 * - RTK Query middleware for caching and request management
 */
function makeStore(initialState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      listings: listingsReducer,
      siteSettings: siteSettingsReducer,
      history: historyReducer,
      subreddits: subredditsReducer,
      redditMultiReddits: multiRedditsReducer,
      redditBearer: bearerReducer,
      redditMe: meReducer,
      redditApi: redditApiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(redditApiMiddleware),
    preloadedState: initialState,
  });
}

type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export let store: AppStore;

/**
 * Initialize the store with optional persisted state
 * This should be called once from index.js
 */
export function initializeStore(preloadedState?: Partial<RootState>): AppStore {
  store = makeStore(preloadedState);
  return store;
}

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import listingsReducer from './slices/listingsSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import historyReducer from './slices/historySlice';
import bearerReducer from './slices/redditBearerSlice';
import meReducer from './slices/redditMeSlice';
import subredditFilterReducer from './slices/subredditFilterSlice';
import subredditPollingReducer from './slices/subredditPollingSlice';
import { redditApiReducer, redditApiMiddleware } from './api';

/**
 * Root reducer combining all slice reducers.
 * Defined separately to derive RootState without circular references.
 */
const rootReducer = combineReducers({
  listings: listingsReducer,
  siteSettings: siteSettingsReducer,
  history: historyReducer,
  redditBearer: bearerReducer,
  redditMe: meReducer,
  redditApi: redditApiReducer,
  subredditFilter: subredditFilterReducer,
  subredditPolling: subredditPollingReducer,
});

/**
 * RootState derived from the root reducer to avoid circular type references.
 */
export type RootState = ReturnType<typeof rootReducer>;

/**
 * Configure the Redux store with all slice reducers
 * Following Redux Toolkit best practices:
 * - Single store instance
 * - Automatic Redux DevTools integration
 * - Automatic redux-thunk middleware
 * - Development-mode checks for mutations and serializability
 * - RTK Query middleware for caching and request management
 */
export function makeStore(initialState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(redditApiMiddleware),
    preloadedState: initialState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export let store: AppStore;

/**
 * Initialize the store with optional persisted state
 * This should be called once from index.js
 */
export function initializeStore(preloadedState?: Partial<RootState>): AppStore {
  store = makeStore(preloadedState);

  // Enable automatic refetch behaviors:
  // - refetchOnFocus: Refetch when window regains focus
  // - refetchOnReconnect: Refetch when network reconnects
  setupListeners(store.dispatch);

  return store;
}

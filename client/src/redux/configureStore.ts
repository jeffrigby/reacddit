import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import listingsReducer from './slices/listingsSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import historyReducer from './slices/historySlice';
import subredditsReducer from './slices/subredditsSlice';
import multiRedditsReducer from './slices/multiRedditsSlice';
import bearerReducer from './slices/redditBearerSlice';
import meReducer from './slices/redditMeSlice';

/**
 * Configure the Redux store with all slice reducers
 * Following Redux Toolkit best practices:
 * - Single store instance
 * - Automatic Redux DevTools integration
 * - Automatic redux-thunk middleware
 * - Development-mode checks for mutations and serializability
 */
const configureReduxStore = (
  initialState?: PreloadedState<Omit<RootState, 'api'>>
) =>
  configureStore({
    reducer: {
      listings: listingsReducer,
      siteSettings: siteSettingsReducer,
      history: historyReducer,
      subreddits: subredditsReducer,
      redditMultiReddits: multiRedditsReducer,
      redditBearer: bearerReducer,
      redditMe: meReducer,
    },
    preloadedState: initialState,
  });

// Create store instance for the application
export const store = configureReduxStore();

// Infer types from the store itself (best practice)
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export factory function as default for testing
export default configureReduxStore;

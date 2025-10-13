import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import * as subreddits from './reducers/subreddits';
import * as listings from './reducers/listings';
import * as reddit from './reducers/reddit';
import siteSettingsSlice from './slices/siteSettingsSlice';
import historySlice from './slices/historySlice';
import multiRedditsReducer from './slices/multiRedditsSlice';

const configureReduxStore = (initialState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: {
      ...subreddits,
      ...listings,
      ...reddit,
      siteSettings: siteSettingsSlice,
      history: historySlice,
      redditMultiReddits: multiRedditsReducer,
    },
    preloadedState: initialState,
  });

export default configureReduxStore;

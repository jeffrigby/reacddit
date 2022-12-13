import { configureStore } from '@reduxjs/toolkit';
import * as subreddits from './reducers/subreddits';
import * as listings from './reducers/listings';
import * as reddit from './reducers/reddit';
import siteSettingsSlice from './slices/siteSettingsSlice';
import historySlice from './slices/historySlice';

const configureReduxStore = (initialState) =>
  configureStore({
    reducer: {
      ...subreddits,
      ...listings,
      ...reddit,
      siteSettings: siteSettingsSlice,
      history: historySlice,
    },
    preloadedState: initialState,
  });

export default configureReduxStore;

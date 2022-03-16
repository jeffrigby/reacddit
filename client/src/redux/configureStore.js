import { configureStore } from '@reduxjs/toolkit';
import * as subreddits from './reducers/subreddits';
import * as listings from './reducers/listings';
import * as reddit from './reducers/reddit';
import siteSettingsSlice from './slices/siteSettingsSlice';

const configureReduxStore = (initialState) =>
  configureStore({
    reducer: {
      ...subreddits,
      ...listings,
      ...reddit,
      siteSettings: siteSettingsSlice,
    },
    preloadedState: initialState,
  });

export default configureReduxStore;

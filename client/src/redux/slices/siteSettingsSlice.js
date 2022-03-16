import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  view: 'expanded',
  debug: false,
  condenseSticky: true,
  condenseDuplicate: true,
  condensePinned: true,
  stream: false,
  autoplay: true,
  pinMenu: true,
};

const siteSettingsSlice = createSlice({
  name: 'SITE_SETTINGS',
  initialState,
  reducers: {
    siteSettings(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
});

export const { siteSettings } = siteSettingsSlice.actions;

export default siteSettingsSlice.reducer;

/**
 * Modern Redux Toolkit slice for site-wide user settings
 * Following Redux Toolkit 2.0+ best practices
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * State shape for site settings slice
 */
export interface SiteSettingsState {
  /** View mode: expanded shows full posts, condensed shows compact view */
  view: 'expanded' | 'condensed';
  /** Enable debug information display */
  debug: boolean;
  /** Automatically condense sticky posts in condensed view */
  condenseSticky: boolean;
  /** Automatically condense duplicate/crossposted content in condensed view */
  condenseDuplicate: boolean;
  /** Automatically condense pinned posts in condensed view */
  condensePinned: boolean;
  /** Enable auto-refresh (stream mode) */
  stream: boolean;
  /** Auto-play videos when they come into view */
  autoplay: boolean;
  /** Keep sidebar menu pinned open */
  pinMenu: boolean;
  /** Theme setting (dark/light) */
  theme?: 'dark' | 'light';
  /** Enable auto-refresh feature */
  autoRefresh?: boolean;
}

/**
 * Initial state with sensible defaults
 */
const initialState: SiteSettingsState = {
  view: 'expanded',
  debug: false,
  condenseSticky: true,
  condenseDuplicate: true,
  condensePinned: true,
  stream: false,
  autoplay: true,
  pinMenu: true,
  theme: 'dark',
  autoRefresh: false,
};

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState,
  reducers: {
    siteSettingsChanged(
      state,
      action: PayloadAction<Partial<SiteSettingsState>>
    ) {
      Object.assign(state, action.payload);
    },

    siteSettingsReset(state) {
      return initialState;
    },
  },
});

export const { siteSettingsChanged, siteSettingsReset } =
  siteSettingsSlice.actions;

export default siteSettingsSlice.reducer;

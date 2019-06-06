export function disableHotKeys(state = false, action) {
  switch (action.type) {
    case 'DISABLE_HOTKEYS':
      return action.disableHotKeys;

    default:
      return state;
  }
}

export function siteSettings(
  state = {
    view: 'expanded',
    debug: false,
    condenseSticky: true,
    stream: false,
    autoplay: true,
  },
  action
) {
  switch (action.type) {
    case 'SITE_SETTINGS':
      return {
        ...state,
        ...action.setting,
      };

    default:
      return state;
  }
}

export function menus(state = {}, action) {
  switch (action.type) {
    case 'MENUS':
      return {
        ...state,
        ...action.menuToggle,
      };

    default:
      return state;
  }
}

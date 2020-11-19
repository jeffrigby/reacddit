// eslint-disable-next-line import/prefer-default-export
export function siteSettings(
  state = {
    view: 'expanded',
    debug: false,
    condenseSticky: true,
    condenseDuplicate: true,
    condensePinned: true,
    stream: false,
    autoplay: true,
    pinMenu: true,
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

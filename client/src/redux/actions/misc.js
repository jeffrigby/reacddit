export function disableHotKeys(bool) {
  return {
    type: 'DISABLE_HOTKEYS',
    disableHotKeys: bool,
  };
}

export function siteSettings(setting) {
  return {
    type: 'SITE_SETTINGS',
    setting,
  };
}

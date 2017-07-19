export function debugMode(bool) {
  return {
    type: 'DEBUG_MODE',
    debugMode: bool,
  };
}

export function disableHotKeys(bool) {
  return {
    type: 'DISABLE_HOTKEYS',
    debugMode: bool,
  };
}

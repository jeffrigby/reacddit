export function debugMode(state = false, action) {
  switch (action.type) {
    case 'DEBUG_MODE':
      return action.debugMode;

    default:
      return state;
  }
}

export function disableHotKeys(state = false, action) {
  switch (action.type) {
    case 'DISABLE_HOTKEYS':
      return action.disableHotKeys;

    default:
      return state;
  }
}

export function authInfo(state = {}, action) {
  switch (action.type) {
    case 'AUTH_INFO':
      return action.authInfoState;

    default:
      return state;
  }
}

export function authStatus(state = 'unloaded', action) {
  switch (action.type) {
    case 'AUTH_STATUS':
      return action.authStatus;

    default:
      return state;
  }
}

export function debugMode(state = false, action) {
  switch (action.type) {
    case 'DEBUG_MODE':
      return action.debugMode;

    default:
      return state;
  }
}

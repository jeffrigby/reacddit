require('es6-promise').polyfill();
require('isomorphic-fetch');

export function authInfo(authInfoState) {
  return {
    type: 'AUTH_INFO',
    authInfoState,
  };
}

export function debugMode(bool) {
  return {
    type: 'DEBUG_MODE',
    debugMode: bool,
  };
}

export function authInfoStatus(authStatus) {
  return {
    type: 'AUTH_STATUS',
    authStatus,
  };
}

export function authInfoFetch() {
  return (dispatch) => {
    dispatch(authInfoStatus('loading'));
    fetch('/json/accessToken', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        dispatch(authInfoStatus('loaded'));
        return response;
      })
      .then(response => response.json())
      .then((json) => {
        dispatch(authInfo(json));
        return json;
      })
      .catch(() => {
        dispatch(authInfoStatus('error'));
      });
  };
}

const authInfo = (state = {}, action) => {
  switch (action.type) {
    case 'AUTH_INFO':
      return action.authInfo;

    default:
      return state;
  }
};

export default authInfo;

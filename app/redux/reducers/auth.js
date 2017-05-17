export function authInfo(state = {}, action) {
    switch (action.type) {
        case 'AUTH_INFO':
            return action.authInfo;

        default:
            return state;
    }
}

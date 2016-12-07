import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const filter = (state = '', action) => {
    switch (action.type) {
        case types.FILTER:
            return action.filter;
        default:
            return state;
    }
};

const accessToken = (state = '', action) => {
    switch (action.type) {
        case types.ACCESSTOKEN:
            return action.accessToken;
        default:
            return state;
    }
};


const rootReducer = combineReducers({
    filter,
    accessToken,
    routing
});

export default rootReducer;

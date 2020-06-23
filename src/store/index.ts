import reduxLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, Store } from "redux";

import rootReducer from "../reducers/index";
import { getMasterData, getWebApps } from '../actions/app';

function getMiddleWare() {
    if (ENV === "development") {
        return applyMiddleware(
            thunkMiddleware,
            reduxLogger,
        )
    } else {
        return applyMiddleware(
            thunkMiddleware,
        )
    }
}

const store = createStore(
    rootReducer,
    getMiddleWare(),
);

// @ts-ignore
window.store = store;
export default store;
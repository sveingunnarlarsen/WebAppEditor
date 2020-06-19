import reduxLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, Store } from "redux";

import rootReducer from "../reducers/index";
import { getMasterData, getWebApps } from '../actions/app';

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        reduxLogger,
    )
);

// @ts-ignore
window.store = store;
export default store;
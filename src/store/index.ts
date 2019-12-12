import reduxLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import {createStore, applyMiddleware} from "redux";

import rootReducer from "../reducers/index";
import {fetchEditorData, fetchWebApps} from '../actions/ajax';

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
    )
);

store.dispatch(fetchEditorData());
store.dispatch(fetchWebApps());

window.store = store;
export default store;
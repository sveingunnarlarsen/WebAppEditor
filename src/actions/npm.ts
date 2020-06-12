import { Actions } from "../types";
import { DialogType } from "../types/dialog";

import { openDialog } from "./";
import { saveFso } from "./file";
import { throwError, handleAjaxError, handleClientError } from "./error";

export function getNpmModules() {
    return function(dispatch, getState) {
        dispatch(requestModules());

        return fetch(`/api/webapp/${getState().app.id}/npm`)
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    dispatch(receiveModules(json))
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    };
}

export function installNpmModules(runUpgrade: boolean = false) {
    return function(dispatch, getState) {
        dispatch(startModuleUpdate());

        return fetch(`/api/webapp/${getState().app.id}/npm${runUpgrade ? "?upgrade=true" : ""}`, {
            method: "PUT"
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    await updatePackageJson(json.packageJson, getState, dispatch);
                    dispatch(openDialog(DialogType.SERVER_MESSAGE, { type: "npm", json }))
                    dispatch(getNpmModules())
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
            .finally(() => dispatch(endModuleUpdate()));
    };
}

export function deleteNpmModules() {
    return function(dispatch, getState) {
        dispatch(requestDeleteModules());

        return fetch(`/api/webapp/${getState().app.id}/npm`, {
            method: "DELETE"
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    dispatch(receiveDeleteModules());
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    };
}

function updatePackageJson(value, getState, dispatch) {
    const packageJson = getState().app.fileSystemObjects.find(f => f.path === "/package.json");
    dispatch(saveFso({...packageJson, content: value}));
}

function requestModules() {
    return {
        type: Actions.REQUEST_MODULES
    };
}

function receiveModules(modules) {
    return {
        type: Actions.RECEIVE_MODULES,
        modules
    };
}

function startModuleUpdate() {
    return {
        type: Actions.START_MODULE_UPDATE
    };
}

function endModuleUpdate(result?) {
    return {
        type: Actions.END_MODULE_UPDATE,
        result
    };
}

function requestDeleteModules() {
    return {
        type: Actions.REQUEST_DELETE_MODULES
    };
}

function receiveDeleteModules() {
    return {
        type: Actions.RECEIVE_DELETE_MODULES
    };
}
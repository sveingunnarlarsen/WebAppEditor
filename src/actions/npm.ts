import {Actions} from "../types";
import {DialogType} from "../types/dialog";
import {openDialog} from "./";
import {saveFso} from "./file";
import {throwError, handleAjaxError} from "./error";

export function getNpmModules() {
	return function(dispatch, getState) {
		dispatch(requestModules());

		return fetch(`/api/webapp/${getState().app.id}/npm`)
			.then(throwError)
			.then(response => response.json())
			.then(json => dispatch(receiveModules(json)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function installNpmModules(runUpgrade: boolean) {
	return function(dispatch, getState) {
		dispatch(startModuleUpdate());

		return fetch(`/api/webapp/${getState().app.id}/npm${runUpgrade ? "?upgrade=true" : ""}`, {
			method: "PUT"
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => {
				updatePackageJson(json.packageJson, getState, dispatch);
				return json;
			})
			.then(json => dispatch(openDialog(DialogType.SERVER_MESSAGE, {type: "npm", json})))
			.then(() => dispatch(getNpmModules()))
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
			.then(response => response.json())
			.then(json => dispatch(receiveDeleteModules()))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

function updatePackageJson(value, getState, dispatch) {
	const packageJson = getState().app.fileSystemObjects.find(f => f.path === "/package.json");
	packageJson.content = value;
	console.log("Updating package json: ", packageJson);
	dispatch(saveFso(packageJson));
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
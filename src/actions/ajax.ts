import {openDialog, startCompile, endCompile, requestWebApps, receiveWebApps, requestEditorData, receiveEditorData} from "./";
import {DialogType} from "../types/dialog";

export function throwError(response) {
	if (!response.ok) {
		throw response;
	}
	return response;
}

export async function handleAjaxError(error, dispatch) {
	const status = error.status;
	const json = status ? await error.json() : {status: "Request failed. No connection to server."};
	return dispatch(openDialog(DialogType.AJAX_ERROR, {status, json}));
}

async function handleCompileError(error, dispatch) {
	dispatch(endCompile());
	const reader = error.body.getReader();
	const part = await reader.read();
	const value = part.value;
	const decoder = new TextDecoder("utf-8");
	const html = decoder.decode(value);
	return dispatch(openDialog(DialogType.COMPILE_ERROR, html));
}

export function compileProject() {
	return function(dispatch, getState) {
		dispatch(startCompile());

		return fetch(`/api/webapp/${getState().app.id}/deploy`, {
			method: "POST"
		})
			.then(throwError)
			.catch(error => handleCompileError(error, dispatch))
			.finally(() => dispatch(endCompile()));
	};
}

export function fetchEditorData() {
	return function(dispatch) {
		dispatch(requestEditorData());

		return fetch(`/api/editor/data`)
			.then(throwError)
			.then(response => response.json())
			.then(json => dispatch(receiveEditorData(json)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function fetchWebApps() {
	return function(dispatch) {
		dispatch(requestWebApps());

		return fetch(`/api/webapp`)
			.then(throwError)
			.then(response => response.json())
			.then(json => dispatch(receiveWebApps(json.apps)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}



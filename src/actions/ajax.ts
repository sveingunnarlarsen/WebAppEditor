import {openDialog, startCompile, endCompile, requestWebApps, receiveWebApps, requestEditorData, receiveEditorData} from "./";
import {DialogType} from "../types/dialog";

export function throwError(response) {
	if (!response.ok) {
		throw response;
	}
	return response;
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
			.then(response => dispatch(endCompile()))
			.catch(error => handleCompileError(error, dispatch));
	};
}

export function fetchEditorData() {
	return function(dispatch) {
		dispatch(requestEditorData());

		return fetch("/api/editor/data")
			.then(response => response.json(), error => console.log("An error occured", error)) //TODO: Error dispatch.
			.then(json => dispatch(receiveEditorData(json)));
	};
}

export function fetchWebApps() {
	return function(dispatch) {
		dispatch(requestWebApps());

		return fetch("/api/webapp")
			.then(response => response.json(), error => console.log("An error occured", error)) //TODO: Error dispatch
			.then(json => dispatch(receiveWebApps(json.apps)));
	};
}

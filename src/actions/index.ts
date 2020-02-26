import {SWITCH_TOOL} from "../constants/action-types";

import {TOGGLE_PREVIEW, TOGGLE_COMMAND_LINE} from "../constants/action-types";
import {SET_SELECTED_NODE} from "../constants/action-types";

import {REQUEST_WEBAPPS} from "../constants/action-types";
import {RECEIVE_WEBAPPS} from "../constants/action-types";
import {REQUEST_EDITOR_DATA} from "../constants/action-types";
import {RECEIVE_EDITOR_DATA} from "../constants/action-types";

import {START_COMPILE} from "../constants/action-types";
import {END_COMPILE} from "../constants/action-types";

import {TOOL_RESIZED} from "../constants/action-types";
import {EDITOR_RESIZED} from "../constants/action-types";
import {TERMINAL_RESIZED} from "../constants/action-types";

import {DialogAction, DialogType} from "../types/dialog";

export function resizeTool() {
	return {
		type: TOOL_RESIZED,
	};
}

export function resizeEditor() {
	return {
	    type: EDITOR_RESIZED,
	};
}

export function resizeTerminal() {
	return {
	    type: TERMINAL_RESIZED,
	};
}

export function startCompile() {
	return {
		type: START_COMPILE
	};
}

export function endCompile() {
	return {
		type: END_COMPILE
	};
}

export function openDialog(dialog: DialogType, data) {
	return {
		type: DialogAction.OPEN,
		dialog,
		data
	};
}

export function closeDialog() {
	return {
		type: DialogAction.CLOSE
	};
}

export function setSelectedNode(id) {
	return {
		type: SET_SELECTED_NODE,
		id
	};
}

export function toggleCommandLine() {
	return {
		type: TOGGLE_COMMAND_LINE
	};
}

export function togglePreview() {
	return {
		type: TOGGLE_PREVIEW
	};
}

export function switchTool(tool) {
	return {
		type: SWITCH_TOOL,
		tool
	};
}

export function requestWebApps() {
	return {
		type: REQUEST_WEBAPPS
	};
}

export function receiveWebApps(data) {
	return {
		type: RECEIVE_WEBAPPS,
		receivedAt: Date.now(),
		data
	};
}

export function requestEditorData() {
	return {
		type: REQUEST_EDITOR_DATA
	};
}

export function receiveEditorData(data) {
	return {
		type: RECEIVE_EDITOR_DATA,
		receivedAt: Date.now(),
		data
	};
}

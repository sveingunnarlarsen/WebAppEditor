import {Actions} from "../types";
import {DialogAction, DialogType} from "../types/dialog";

import {getWebApps} from "./app";

export function reset() {
    return {
        type: Actions.RESET,
    }
}

export function switchTool(tool) {
	return {
		type: Actions.SWITCH_TOOL,
		tool
	};
}

export function toggleCLI() {
	return {
		type: Actions.TOGGLE_CLI
	};
}

export function togglePreview() {
	return {
		type: Actions.TOGGLE_PREVIEW
	};
}

export function startGitCloneClone() {
	return {
		type: Actions.START_GIT_CLONE
	};
}

export function endGitClone() {
	return {
		type: Actions.END_GIT_CLONE
	};
}

export function resizeTool() {
	return {
		type: Actions.RESIZE_TOOL,
	};
}

export function resizeEditor() {
	return {
		type: Actions.RESIZE_EDITOR
	};
}

export function resizeTerminal() {
	return {
		type: Actions.RESIZE_TERMINAL
	};
}

export function updateEditors() {
	return {
		type: Actions.UPDATE_EDITORS
	}
}

export function openDialog(dialog: DialogType, data?) {
	return function(dispatch, getState) {
	    if (dialog === DialogType.PROJECT_LIST) {
	        dispatch(getWebApps());   
	    }
        return dispatch(openDialogAction(dialog, data));
	};
}

export function closeDialog() {
	return {
		type: DialogAction.CLOSE
	};
}

export function setSelectedNode(id) {
	return {
		type: Actions.SET_SELECTED_NODE,
		id
	};
}

function openDialogAction(dialog: DialogType, data) {
	return {
		type: DialogAction.OPEN,
		dialog,
		data
	};
}
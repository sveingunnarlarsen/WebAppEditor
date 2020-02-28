import produce from "immer";
import {combineReducers} from "redux";

import {SWITCH_TOOL} from "../constants/action-types";
import {TOGGLE_PREVIEW} from "../constants/action-types";
import {TOGGLE_COMMAND_LINE} from "../constants/action-types";

import {SET_SELECTED_NODE} from "../constants/action-types";

import {START_COMPILE} from "../constants/action-types";
import {END_COMPILE} from "../constants/action-types";

import {REQUEST_EDITOR_DATA} from "../constants/action-types";
import {RECEIVE_EDITOR_DATA} from "../constants/action-types";

import {REQUEST_WEBAPPS} from "../constants/action-types";
import {RECEIVE_WEBAPPS} from "../constants/action-types";

import {AppEditorState, Tool} from "../types";
import {AppActions} from "../types/app";
import {DialogAction} from "../types/dialog";

import editor from "./editor";
import app from "./app";

const initialState: AppEditorState = {
	visibleTool: Tool.EXPLORER,
	previewVisible: false,
	commandLineVisible: false,
	isCompiling: false,
	modules: [],
	isUpdatingNpm: false,
	isCloning: false,
	toolResized: 0,
	editorResized: 0,
	terminalResized: 0,
	selectedNode: "",
	resources: {
		isFetching: false
	},
	apps: {
		isFetching: false,
		list: []
	},
	dialog: {
		visible: false,
		type: null,
		data: null
	}
};

function fetching(state, data = {}) {
	return Object.assign({}, state, data, {
		isFetching: true
	});
}

function doneFetching(state, data = {}) {
	return Object.assign({}, state, data, {
		isFetching: false
	});
}

function selectedNode(state = initialState.selectedNode, action) {
	if (action.type === SET_SELECTED_NODE) {
		return action.id;
	}
	return state;
}

function visibleTool(state = initialState.visibleTool, action) {
	if (action.type == SWITCH_TOOL) {
		return action.tool;
	}
	return state;
}

function previewVisible(state = initialState.previewVisible, action) {
	if (action.type === TOGGLE_PREVIEW) {
		return !state;
	}
	return state;
}

function commandLineVisible(state = initialState.commandLineVisible, action) {
	if (action.type === TOGGLE_COMMAND_LINE) {
		return !state;
	}
	return state;
}

function isCompiling(state = initialState.isCompiling, action) {
	if (action.type === START_COMPILE) {
		return true;
	} else if (action.type === END_COMPILE) {
		return false;
	}
	return state;
}

function modules(state = initialState.modules, action) {
	if (action.type === AppActions.REQUEST_MODULES) {
		return [];
	} else if (action.type === AppActions.RECEIVE_MODULES) {
		return action.modules;
	} else if (AppActions.REQUEST_DELETE_MODULES) {
	    
	} else if (AppActions.RECEIVE_DELETE_MODULES) {
	    return [];
	}
	return state;
}

function isUpdatingNpm(state = initialState.isUpdatingNpm, action) {
	if (action.type === AppActions.START_MODULE_UPDATE) {
		return true;
	} else if (action.type === AppActions.END_MODULE_UPDATE) {
		return false;
	}
	return state;
}

function isCloning(state = initialState.isCloning, action) {
	if (action.type === AppActions.START_CLONING) {
		return true;
	} else if (action.type === AppActions.END_CLONING) {
		return false;
	}
	return state;
}

function resources(state = initialState.resources, action) {
	switch (action.type) {
		case REQUEST_EDITOR_DATA:
			return fetching(state);
		case RECEIVE_EDITOR_DATA:
			return doneFetching(state, action.data);
		default:
			return state;
	}
}

function apps(state = initialState.apps, action) {
	switch (action.type) {
		case REQUEST_WEBAPPS:
			return fetching(state);
		case RECEIVE_WEBAPPS:
			return doneFetching(state, {list: action.data});
		default:
			return state;
	}
}

function dialog(state = initialState.dialog, action) {
	if (action.type === DialogAction.OPEN) {
		return {
			visible: true,
			type: action.dialog,
			data: action.data
		};
	} else if (action.type === DialogAction.CLOSE) {
		return {
			visible: false,
			type: null,
			data: null
		};
	}
	return state;
}

function toolResized(state = initialState.toolResized, action) {
	console.log(action.type);
	if (action.type === "TOOL_RESIZED") {
		return state + 1;
	}
	return state;
}

function editorResized(state = initialState.toolResized, action) {
	if (action.type === "EDITOR_RESIZED") {
		return state + 1;
	}
	return state;
}

function terminalResized(state = initialState.toolResized, action) {
	if (action.type === "TERMINAL_RESIZED") {
		return state + 1;
	}
	return state;
}

const rootReducer = combineReducers({
	visibleTool,
	selectedNode,
	previewVisible,
	commandLineVisible,
	toolResized,
	editorResized,
	terminalResized,
	isCompiling,
	modules,
	isUpdatingNpm,
	isCloning,
	resources,
	app,
	apps,
	dialog,
	editor
});

export default rootReducer;

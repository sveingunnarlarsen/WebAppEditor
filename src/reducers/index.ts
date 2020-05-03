import produce from "immer";
import {combineReducers} from "redux";
import {AppEditorState, Tool, Actions} from "../types";
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
	if (action.type === Actions.SET_SELECTED_NODE) {
		return action.id;
	}
	return state;
}

function visibleTool(state = initialState.visibleTool, action) {
	if (action.type == Actions.SWITCH_TOOL) {
		return action.tool;
	}
	return state;
}

function previewVisible(state = initialState.previewVisible, action) {
	if (action.type === Actions.TOGGLE_PREVIEW) {
		return !state;
	}
	return state;
}

function commandLineVisible(state = initialState.commandLineVisible, action) {
	if (action.type === Actions.TOGGLE_CLI) {
		return !state;
	}
	return state;
}

function isCompiling(state = initialState.isCompiling, action) {
	if (action.type === Actions.REQUEST_COMPILE) {
		return true;
	} else if (action.type === Actions.RECEIVE_COMPILE) {
		return false;
	}
	return state;
}

function modules(state = initialState.modules, action) {
	if (action.type === Actions.REQUEST_MODULES || action.type === Actions.RESET) {
		return [];
	} else if (action.type === Actions.RECEIVE_MODULES) {
		return action.modules;
	} else if (Actions.REQUEST_DELETE_MODULES) {
	    
	} else if (Actions.RECEIVE_DELETE_MODULES) {
	    return [];
	}
	return state;
}

function isUpdatingNpm(state = initialState.isUpdatingNpm, action) {
	if (action.type === Actions.START_MODULE_UPDATE) {
		return true;
	} else if (action.type === Actions.END_MODULE_UPDATE) {
		return false;
	}
	return state;
}

function isCloning(state = initialState.isCloning, action) {
	if (action.type === Actions.START_GIT_CLONE) {
		return true;
	} else if (action.type === Actions.END_GIT_CLONE) {
		return false;
	}
	return state;
}

function resources(state = initialState.resources, action) {
	switch (action.type) {
		case Actions.REQUEST_MASTERDATA:
			return fetching(state);
		case Actions.RECEIVE_MASTERDATA:
			return doneFetching(state, action.data);
		default:
			return state;
	}
}

function apps(state = initialState.apps, action) {
	switch (action.type) {
		case Actions.REQUEST_WEBAPPS:
			return fetching(state);
		case Actions.RECEIVE_WEBAPPS:
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
	if (action.type === Actions.RESIZE_TOOL) {
		return state + 1;
	}
	return state;
}

function editorResized(state = initialState.toolResized, action) {
	if (action.type === Actions.RESIZE_EDITOR) {
		return state + 1;
	}
	return state;
}

function terminalResized(state = initialState.toolResized, action) {
	if (action.type === Actions.RESIZE_TERMINAL) {
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

import produce from "immer";
import {combineReducers} from "redux";
import {AppEditorState, Tool, Actions} from "../types";
import {DialogAction} from "../types/dialog";

import {initState as appInitState, app} from "./app";
import {initState as editorInitState, editor} from "./editor";

const initialState: AppEditorState = {
	visibleTool: Tool.EXPLORER,
	selectedNode: "",
	previewVisible: false,
	commandLineVisible: false,
	toolResized: 0,
	editorResized: 0,
	terminalResized: 0,
	updateEditors: 0,
	isCompiling: false,
	modules: [],
	isUpdatingNpm: false,
	isCloning: false,
	resources: {
		isFetching: false
	},
	app: appInitState,
	apps: {
		isFetching: false,
		list: []
	},
	dialog: {
		visible: false,
		type: null,
		data: null
	},
	editor: editorInitState,
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
	} else if (action.type === Actions.RESET) {
	    return initialState.selectedNode;
	}
	return state;
}

function visibleTool(state = initialState.visibleTool, action) {
	if (action.type == Actions.SWITCH_TOOL) {
		return action.tool;
	} else if (action.type === Actions.RESET) {
	    return initialState.visibleTool;
	}
	return state;
}

function previewVisible(state = initialState.previewVisible, action) {
	if (action.type === Actions.TOGGLE_PREVIEW) {
		return !state;
	} else if (action.type === Actions.RESET) {
	    return initialState.previewVisible;
	}
	return state;
}

function commandLineVisible(state = initialState.commandLineVisible, action) {
	if (action.type === Actions.TOGGLE_CLI) {
		return !state;
	} else if (action.type === Actions.RESET) {
	    return initialState.commandLineVisible;
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
	} else if (action.type === Actions.REQUEST_DELETE_MODULES) {
	    
	} else if (action.type === Actions.RECEIVE_DELETE_MODULES) {
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
	} else if (action.type === Actions.RESET) {
	    return initialState.toolResized;
	}
	return state;
}

function editorResized(state = initialState.editorResized, action) {
	if (action.type === Actions.RESIZE_EDITOR) {
		return state + 1;
	} else if (action.type === Actions.RESET) {
	    return initialState.editorResized;
	}
	return state;
}

function terminalResized(state = initialState.terminalResized, action) {
	if (action.type === Actions.RESIZE_TERMINAL) {
		return state + 1;
	} else if (action.type === Actions.RESET) {
	    return initialState.terminalResized;
	}
	return state;
}

function updateEditors(state = initialState.updateEditors, action) {
	if (action.type === Actions.UPDATE_EDITORS) {
		return state + 1;
	} else if (action.type === Actions.RESET) {
		return initialState.updateEditors;
	}
	return state;
}

const rootReducer = combineReducers<AppEditorState>({
	visibleTool,
	selectedNode,
	previewVisible,
	commandLineVisible,
	toolResized,
	editorResized,
	terminalResized,
	updateEditors,
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

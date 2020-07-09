import produce from "immer";
import { combineReducers, Action } from "redux";
import { AppEditorState, Tool, Actions, CompilationDetails } from "../types";
import { DialogAction } from "../types/dialog";
import { SetSelectedNodeAction, SwitchToolAction } from "../types/actions";

import { initState as appInitState, app } from "./app";
import { initState as editorInitState, editor } from "./editor";
import { initState as resourcesInitState, resources} from "./resources";

const initialState: AppEditorState = {
    darkState: true,
    centerScroll: false,
    visibleTool: Tool.EXPLORER,
    selectedNode: "",
    previewVisible: false,
    commandLineVisible: false,
    toolResized: 0,
    editorResized: 0,
    terminalResized: 0,
    updateEditors: 0,
    recalculateEditorWidth: 0,
    isCreating: false,
    isCompiling: false,
    isDeleting: false,
    modules: [],
    isUpdatingNpm: false,
    isCloning: false,
    languageServerConnected: true,
    resources: resourcesInitState,
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
    compilationDetails: {
        development: {
            assets: []
        },
        production: {
            assets: []
        }
    },
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

function selectedNode(state: string = initialState.selectedNode, action: SetSelectedNodeAction): string {
    if (action.type === Actions.SET_SELECTED_NODE) {
        return action.id;
    } else if (action.type === Actions.RESET) {
        return initialState.selectedNode;
    }
    return state;
}

function visibleTool(state: Tool = initialState.visibleTool, action: SwitchToolAction): Tool {
    if (action.type == Actions.SWITCH_TOOL) {
        return action.tool;
    } else if (action.type === Actions.RESET) {
        return initialState.visibleTool;
    }
    return state;
}

function previewVisible(state: boolean = initialState.previewVisible, action): boolean {
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

function isCreating(state = initialState.isCreating, action) {
    if (action.type === Actions.REQUEST_CREATE_WEBAPP) {
        return true;
    } else if (action.type === Actions.RECEIVE_WEBAPP || action.type === Actions.CANCEL_SNACKBARS) {
        return false;
    }
    return state;
}

function isCompiling(state = initialState.isCompiling, action) {
    if (action.type === Actions.REQUEST_COMPILE) {
        return true;
    } else if (action.type === Actions.RECEIVE_COMPILE || action.type === Actions.CANCEL_SNACKBARS) {
        return false;
    }
    return state;
}

function isDeleting(state = initialState.isDeleting, action) {
    if (action.type === Actions.REQUEST_DELETE_WEBAPP) {
        return true;
    } else if (action.type === Actions.RESET || action.type === Actions.CANCEL_SNACKBARS) {
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

function compilationDetails(state = initialState.compilationDetails, action: Action & { compilationDetails: CompilationDetails }): CompilationDetails {
    switch (action.type) {
        case Actions.RECEIVE_DEV_COMPILATION_DETAILS: {
            return action.compilationDetails;
        }
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

function apps(state = initialState.apps, action) {
    switch (action.type) {
        case Actions.REQUEST_WEBAPPS:
            return fetching(state);
        case Actions.RECEIVE_WEBAPPS:
            return doneFetching(state, { list: action.data });
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
    if (action.type === Actions.RESIZE_TOOL || action.type === Actions.TOGGLE_CLI || action.type === Actions.TOGGLE_PREVIEW) {
        return state + 1;
    } else if (action.type === Actions.RESET) {
        return initialState.toolResized;
    }
    return state;
}

function editorResized(state = initialState.editorResized, action) {
    if (action.type === Actions.RESIZE_EDITOR || action.type === Actions.TOGGLE_CLI || action.type === Actions.TOGGLE_PREVIEW) {
        return state + 1;
    } else if (action.type === Actions.RESET) {
        return initialState.editorResized;
    }
    return state;
}

function terminalResized(state = initialState.terminalResized, action) {
    if (action.type === Actions.RESIZE_TERMINAL || action.type === Actions.TOGGLE_CLI || action.type === Actions.TOGGLE_PREVIEW) {
        return state + 1;
    } else if (action.type === Actions.RESET) {
        return initialState.terminalResized;
    }
    return state;
}

function recalculateEditorWidth(state = initialState.recalculateEditorWidth, action) {
    if (action.type === Actions.RECALCULATE_EDITOR_WIDTH) {
        return state + 1;
    } else if (action.type === Actions.RESET) {
        return initialState.recalculateEditorWidth;
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

function languageServerConnected(state = initialState.languageServerConnected, action) {
    if (action.type === Actions.LANGUAGE_SERVER_CONNECTED) {
        return true;
    } else if (action.type === Actions.LANGUAGE_SERVER_DISCONNECTED) {
        return false;
    }
    return state;
}

function darkState(state = initialState.darkState, action) {
    if (action.type === Actions.TOGGLE_THEME) {
        return !state;
    }
    return state;
}

function centerScroll(state = initialState.centerScroll, action) {
    if(action.type === Actions.TOGGLE_CENTER_SCROLL) {
        return !state;
    }
    return state;
}

const rootReducer = combineReducers<AppEditorState>({
    darkState,
    centerScroll,
    visibleTool,
    selectedNode,
    previewVisible,
    commandLineVisible,
    toolResized,
    editorResized,
    terminalResized,
    recalculateEditorWidth,
    updateEditors,
    isCreating,
    isCompiling,
    isDeleting,
    modules,
    isUpdatingNpm,
    isCloning,
    languageServerConnected,
    resources,
    app,
    apps,
    dialog,
    editor,
    compilationDetails,
});

export default rootReducer;

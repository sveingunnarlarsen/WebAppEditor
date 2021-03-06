import { Action } from "react-redux";
import { Actions, Tool } from "../types";
import { SetSelectedNodeAction, SwitchToolAction } from "../types/actions";
import { DialogAction, DialogType } from "../types/dialog";
import { getWebApps } from "./app";
import { getApis } from "./resources";

export function openDialog(dialog: DialogType, data?) {
    return function(dispatch, getState) {
        if (dialog === DialogType.PROJECT_LIST) {
            dispatch(getWebApps());
        } else if (dialog === DialogType.ADD_DEPENDENCY) {
            dispatch(getApis());
        } else if (dialog === DialogType.CREATE_PROJECT) {
            dispatch(getWebApps());
        }
        return dispatch(openDialogAction(dialog, data));
    };
}

export function reset() {
    return {
        type: Actions.RESET,
    }
}

export function cancelSnackbars() {
    return {
        type: Actions.CANCEL_SNACKBARS,
    }
}

export function languageServerConnected() {
    return {
        type: Actions.LANGUAGE_SERVER_CONNECTED
    }
}

export function languageServerDisconnected() {
    return {
        type: Actions.LANGUAGE_SERVER_DISCONNECTED
    }
}

export function switchTool(tool: Tool): SwitchToolAction {
    return {
        type: Actions.SWITCH_TOOL,
        tool
    };
}

export function toggleCLI(): Action {
    return {
        type: Actions.TOGGLE_CLI
    };
}

export function toggleTheme(): Action {
    return {
        type: Actions.TOGGLE_THEME
    }
}

export function toggleCenterScroll(): Action {
    return {
        type: Actions.TOGGLE_CENTER_SCROLL
    }
}

export function togglePreview(): Action {
    return {
        type: Actions.TOGGLE_PREVIEW
    };
}

export function startGitCloneClone(): Action {
    return {
        type: Actions.START_GIT_CLONE
    };
}

export function endGitClone(): Action {
    return {
        type: Actions.END_GIT_CLONE
    };
}

export function resizeTool(): Action {
    return {
        type: Actions.RESIZE_TOOL,
    };
}

export function resizeEditor(): Action {
    return {
        type: Actions.RESIZE_EDITOR
    };
}

export function resizeTerminal(): Action {
    return {
        type: Actions.RESIZE_TERMINAL
    };
}

export function recalculateEditorWidth(): Action {
    return {
        type: Actions.RECALCULATE_EDITOR_WIDTH,
    }
}

export function updateEditors(): Action {
    return {
        type: Actions.UPDATE_EDITORS
    }
}

export function closeDialog(): Action {
    return {
        type: DialogAction.CLOSE
    };
}

export function setSelectedNode(id: string): SetSelectedNodeAction {
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
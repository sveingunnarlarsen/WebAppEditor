import { Action } from "react-redux";
import { Actions, Tool } from "../types";
import { SetSelectedNodeAction, SwitchToolAction } from "../types/actions";
import { DialogAction, DialogType } from "../types/dialog";
import { getWebApps } from "./app";

export function openDialog(dialog: DialogType, data?) {
    return function(dispatch, getState) {
        if (dialog === DialogType.PROJECT_LIST) {
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
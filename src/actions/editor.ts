import {EditorActions} from "../types/editor";
import {SplitDirection} from "../types/editor";

export function showFile(fileId, editorId) {
    return {
        type: EditorActions.SHOW_FILE,
        fileId,
        editorId,
    }
}

export function closeTab(fileId, editorId) {
    return {
        type: EditorActions.CLOSE_TAB,
        fileId,
        editorId,
    }
}

export function closeFile(fileId) {
    return {
        type: EditorActions.CLOSE_FILE,
        fileId,
    }
}

export function closeAllTabs() {
    return {
        type: EditorActions.CLOSE_ALL_TABS,
    }
}

export function splitEditor(direction: SplitDirection, editorId, fileId) {
    return {
        type: EditorActions.SPLIT_EDITOR,
        direction,
        editorId,
        fileId,
    }
}

export function setActiveEditor(id) {
    return {
        type: EditorActions.SET_ACTIVE_EDITOR,
        id
    }
}

export function showSignatureHelp(data) {
    return {
        type: EditorActions.SHOW_SIGNATURE_HELP,
        data,
    }
}

export function closeSignatureHelp() {
    return {
        type: EditorActions.CLOSE_SIGNATURE_HELP,
    }
}
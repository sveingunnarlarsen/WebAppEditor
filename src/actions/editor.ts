import { EditorActions } from "../types/editor";
import { SplitDirection } from "../types/editor";

export function resetOpenAt() {
    return {
        type: EditorActions.RESET_OPEN_AT,
    }
}

export function resetSetSearch() {
    return {
        type: EditorActions.RESET_SET_SEARCH,
    }
}

export function showFile(fileId: string, editorId?: string, openFileAt?: monaco.IRange, setSearch?: string) {
    return {
        type: EditorActions.SHOW_FILE,
        fileId,
        editorId,
        openFileAt,
        setSearch,
    }
}

export function closeTab(fileId: string, editorId?: string) {
    return {
        type: EditorActions.CLOSE_TAB,
        fileId,
        editorId,
    }
}

export function closeFile(fileId: string) {
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

export function splitEditor(direction: SplitDirection, editorId: string, fileId: string) {
    return {
        type: EditorActions.SPLIT_EDITOR,
        direction,
        editorId,
        fileId,
    }
}

export function setActiveEditor(id: string) {
    return {
        type: EditorActions.SET_ACTIVE_EDITOR,
        id
    }
}
export enum EditorActions {
    RESET_OPEN_AT = "RESET_OPEN_AT",
    RESET_SET_SEARCH = "RESET_SET_SEARCH",
    SHOW_FILE = "SHOW_FILE",
    CLOSE_TAB = "CLOSE_TAB",
    CLOSE_FILE = "CLOSE_FILE",
    CLOSE_ALL_TABS = "CLOSE_ALL_TABS",
    CLOSE_CONTAINER = "CLOSE_CONTAINER",
    SPLIT_EDITOR = "SPLIT_EDITOR",
    SET_ACTIVE_EDITOR = "SET_ACTIVE_EDITOR",
    CLOSE_SIGNATURE_HELP = "CLOSE_SIGNATURE_HELP",
}

export enum SplitDirection {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
}

export interface EditorState {
    activeEditor: string;
    activeContainer: string;
    editors: Editor[];
    containers: EditorContainer[];
    openFileAt: any | null;
    setSearch: any | null;
}

export interface Editor {
    id: string;
    activeTab: string;
    tabs: string[];
}

export interface EditorContainer {
    id: string;
    split: SplitDirection;
    editor1: {
        isContainer: boolean;
        id: string;
    };
    editor2: {
        isContainer: boolean;
        id: string;
    };
}

export enum EditorActions {
    SHOW_FILE = "SHOW_FILE",
    CLOSE_TAB = "CLOSE_TAB",
    CLOSE_FILE = "CLOSE_FILE",
    CLOSE_ALL_TABS = "CLOSE_ALL_TABS",
    CLOSE_CONTAINER = "CLOSE_CONTAINER",
    SPLIT_EDITOR = "SPLIT_EDITOR",
    SET_ACTIVE_EDITOR = "SET_ACTIVE_EDITOR",
    SHOW_SIGNATURE_HELP = "SHOW_SIGNATURE_HELP",
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
	showSignatureHelp: boolean;
	signatureHelpData: any;
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

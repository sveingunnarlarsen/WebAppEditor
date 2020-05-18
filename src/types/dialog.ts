export enum DialogAction {
    OPEN = "OPEN_DIALOG",
    CLOSE = "CLOSE_DIALOG",
}

export enum DialogType {
	CREATE_PROJECT = "CREATE_PROJECT",
	DELETE_PROJECT = "DELETE_PROJECT",
	PROJECT_LIST = "PROJECT_LIST",
	CREATE_FILE = "CREATE_FILE",
	CREATE_FOLDER = "CREATE_FOLDER",
	RENAME_FILE = "RENAME_FILE",
	RENAME_FOLDER = "RENAME_FOLDER",
	DELETE_FILE = "DELETE_FILE",
	DELETE_FOLDER = "DELETE_FOLDER",
	API_BROWSER = "API_BROWSER",
	NPM_BROWSER = "NPM_BROWSER",
	SEARCH_APP = "SEARCH_PROJECT",
	SYNTAX_ERROR = "SYNTAX_ERROR",
	COMPILE_ERROR = "COMPILE_ERROR",
	SHOW_REFERENCES = "SHOW_REFERENCES",
	SERVER_MESSAGE = "SERVER_MESSAGE",
	AJAX_ERROR = "AJAX_ERROR",
	MESSAGE = "MESSAGE",
	NPM_INSTALL = "NPM_INSTALL",
}

export interface DialogState {
	visible: boolean;
	type: DialogType | null;
	data: any;
}
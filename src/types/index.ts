import {DialogType} from "./dialog";
import {EditorState} from "./editor";

export enum Tool {
	EXPLORER = "EXPLORER",
	SEARCH = "SEARCH",
	NPM = "NPM",
	SETTINGS = "SETTINGS",
	GIT = "GIT"
}

export enum FsoType {
	FILE = "file",
	FOLDER = "folder"
}

export interface DateProps {
	updatedAt: number;
	changedBy: string;
	createdAt: number;
	createdBy: string;
}

export interface FileSystemObject extends DateProps {
	id: string;
	name: string;
	value: string;
	path: string;
	content: string;
	type: FsoType;
	disabled: boolean;
	image: string;
	parentId: string;
	webAppId: string;
}

export interface AppSettings {
	entryPoint: {
		javascript: string;
		html: string;
	};
	git: {
		repo: string;
		branch: string;
	};
}

export interface ListApp extends DateProps {
	id: string;
	name: string;
	description: string;
	type: string;
	settings: AppSettings;
}

export interface AppState extends ListApp {
	isFetching: boolean;
	fileSystemObjects: FileSystemObject[];
	updateTree: boolean;
}

export interface AppsState {
    isFetching: boolean;
    list: ListApp[];
}

export interface AppEditorState {
	visibleTool: Tool;
	previewVisible: boolean;
	isCompiling: boolean;
	selectedNode: string;
	resources: any;
	app: AppState;
	apps: {
		isFetching: boolean;
		list: ListApp[];
	};
	editor: EditorState;
	dialog: {
		visible: boolean;
		type: DialogType;
	};
	snackbar: any;
}

import { DialogState, DialogType } from "./dialog";
import { EditorState } from "./editor";

export enum Actions {
    RESET = "RESET",
    SWITCH_TOOL = "SWITCH_TOOL",
    RESIZE_TOOL = "RESIZE_TOOL",
    RESIZE_EDITOR = "RESIZE_EDITOR",
    RESIZE_TERMINAL = "RESIZE_TERMINAL",
    RECALCULATE_EDITOR_WIDTH = "RECALCULATE_EDITOR_WIDTH",
    UPDATE_EDITORS = "UPDATE_EDITORS",
    TOGGLE_PREVIEW = "TOGGLE_PREVIEW",
    TOGGLE_CLI = "TOGGLE_CLI",
    START_GIT_CLONE = "START_GIT_CLONE",
    END_GIT_CLONE = "END_GIT_CLOME",
    REQUEST_MASTERDATA = "REQUEST_MASTERDATA",
    RECEIVE_MASTERDATA = "RECEIVE_MASTERDATA",
    REQUEST_WEBAPPS = "REQUEST_WEBAPPS",
    RECEIVE_WEBAPPS = "RECEIVE_WEBAPPS",
    REQUEST_CREATE_WEBAPP = "REQUEST_CREATE_WEBAPP",
    REQUEST_DELETE_WEBAPP = "REQUEST_DELETE_WEBAPP",
    REQUEST_WEBAPP = "REQUEST_WEBAPP",
    RECEIVE_WEBAPP = "RECEIVE_WEBAPP",
    START_MODULE_UPDATE = "START_MODULE_UPDATE",
    END_MODULE_UPDATE = "END_MODULE_UPDATE",
    REQUEST_MODULES = "REQUEST_MODULES",
    RECEIVE_MODULES = "RECEIVE_MODULES",
    
    REQUEST_DELETE_MODULES = "REQUEST_DELETE_MODULE",
    RECEIVE_DELETE_MODULES = "RECEIVE_DELETE_MODULE",
    REQUEST_COMPILE = "REQUEST_COMPILE",
    RECEIVE_COMPILE = "RECEIVE_COMPILE",
    REQUEST_CREATE_FILE = "REQUEST_CREATE_FILE",
    RECEIVE_CREATE_FILE = "RECEIVE_CREATE_FILE",
    REQUEST_CREATE_FILES = "REQUEST_CREATE_FILES",
    RECEIVE_CREATE_FILES = "RECEIVE_CREATE_FILES",
    REQUEST_SAVE = "REQUEST_SAVE",
    RECEIVE_SAVE = "RECEIVE_SAVE",
    REQUEST_DELETE_FILE = "REQUEST_DELETE_FILE",
    RECEIVE_DELETE_FILE = "RECEIVE_DELETE_FILE",
    REQUEST_DELETE_FILES = "REQUEST_DELETE_FILES",
    RECEIVE_DELETE_FILES = "RECEIVE_DELETE_FILES",
    SET_SELECTED_NODE = "SET_SELECTED_NODE",
    UPDATE_FILE_STATE = "UPDATE_FILE_STATE",
    UPDATE_APP_DATA = "UPDATE_APP_DATA",
}

export enum Tool {
    EXPLORER = "EXPLORER",
    SEARCH = "SEARCH",
    NPM = "NPM",
    SETTINGS = "SETTINGS",
    GIT = "GIT",
}

export enum FsoType {
    FILE = "file",
    FOLDER = "folder",
}

export type project = {
    type: 'react' | 'vue',
    template: 'react' | 'react-typescript' | 'vue',
    name: string,
    description: string,
    remote?: string
}

export interface DateProps {
    updatedAt: number;
    changedBy: string;
    createdAt: number;
    createdBy: string;
}

export interface ServerFso extends DateProps {
    id: string;
    webAppId: string;
    type: FsoType;
    path: string;
    content: string;
}

export interface FileSystemObject extends DateProps {
    id: string;
    name: string;
    value: string;
    path: string;
    content: string;
    orgContent?: string;
    type: FsoType;
    disabled: boolean;
    image: string;
    parentId: string;
    webAppId: string;
    modified?: boolean;
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
    projectFolder: string;
}

export interface ListApp extends DateProps {
    id: string;
    name: string;
    description: string;
    type: 'react' | 'vue' | null;
    settings: AppSettings;
}

export interface AppState extends ListApp {
    isFetching: boolean;
    fileSystemObjects: FileSystemObject[];
    updateTree: boolean;
    isSaving: boolean;
}

export interface AppEditorState {
    visibleTool: Tool;
    selectedNode: string;
    previewVisible: boolean;
    commandLineVisible: boolean;
    toolResized: number;
    editorResized: number;
    terminalResized: number;
    recalculateEditorWidth: number;
    updateEditors: number;
    isCreating: boolean;
    isCompiling: boolean;
    isDeleting: boolean;
    modules: any[];
    isUpdatingNpm: boolean;
    isCloning: boolean;
    resources: any;
    app: AppState;
    apps: {
        isFetching: boolean;
        list: ListApp[];
    };
    editor: EditorState;
    dialog: DialogState;
    snackbar?: any;
}

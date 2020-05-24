import produce from "immer";
import { Actions, AppState } from "../types";

export const initState: AppState = {
    id: "",
    name: "",
    description: "",
    type: "",
    settings: {
        entryPoint: {
            javascript: "",
            html: "",
        },
        git: {
            repo: "",
            branch: "",
        },
        projectFolder: "",
    },
    updatedAt: 0,
    changedBy: "",
    createdAt: 0,
    createdBy: "",
    isFetching: false,
    fileSystemObjects: [],
    updateTree: false,
    isSaving: false,
};

const reset = produce((draft) => {
    return { ...initState };
});

const requestWebApp = produce((draft, appId) => {
    draft.id = appId;
    draft.isFetching = true;
});

const receiveWebApp = produce((draft, app) => {
    return { ...initState, ...app };
});

const requestSave = produce(draft => {
    draft.isSaving = true;
});

const receiveSave = produce((draft, files) => {
    draft.isSaving = false;
    files.forEach(updatedFile => {
        const fileIndex = draft.fileSystemObjects.findIndex(f => f.id === updatedFile.id);
        const fso = draft.fileSystemObjects[fileIndex];
        draft.fileSystemObjects[fileIndex] = {
            ...fso,
            ...updatedFile,
        }
    });
});

const requestCreateFiles = produce((draft, files) => {

});

const receiveCreateFiles = produce((draft, files) => {
    draft.fileSystemObjects.push(...files);
});

const requestCreate = produce((draft, file) => {

});

const receiveCreate = produce((draft, file) => {
    draft.fileSystemObjects.push(file);
});

const requestDelete = produce((draft, file) => {

});

const receiveDelete = produce((draft, id) => {
    const index = draft.fileSystemObjects.findIndex(f => f.id === id);
    draft.fileSystemObjects.splice(index, 1);
});

const requestDeleteFiles = produce((draft) => {

});

const receiveDeleteFiles = produce((draft, files) => {
    files.forEach(file => {
        const index = draft.fileSystemObjects.findIndex(f => f.id === file.id);
        draft.fileSystemObjects.splice(index, 1);
    })
});

const requestModules = produce((draft) => {

});

const receiveModules = produce((draft, modules) => {
    draft.modules = modules;
});

const updateFileState = produce((draft, updatedFile) => {
    let fileIndex;
    if (updatedFile.id) {
        fileIndex = draft.fileSystemObjects.findIndex(f => f.id === updatedFile.id);
    } else {
        fileIndex = draft.fileSystemObjects.findIndex(f => f.path === updatedFile.path);
    }
    const fso = draft.fileSystemObjects[fileIndex];
    draft.fileSystemObjects[fileIndex] = {
        ...fso,
        ...updatedFile
    };
});

const updateAppData = produce((draft, data) => {
    draft.name = data.name;
    draft.description = data.description;
    draft.type = data.type;
    draft.settings = data.settings;
});



export function app(state = initState, action) {

    switch (action.type) {
        case Actions.RESET:
            return reset(state);

        case Actions.REQUEST_WEBAPP:
            return requestWebApp(state, action.id);

        case Actions.RECEIVE_WEBAPP:
            return receiveWebApp(state, action.data);

        case Actions.REQUEST_SAVE:
            return requestSave(state);

        case Actions.RECEIVE_SAVE:
            return receiveSave(state, action.files);

        case Actions.REQUEST_CREATE_FILES:
            return requestCreateFiles(state, action.files);

        case Actions.RECEIVE_CREATE_FILES:
            return receiveCreateFiles(state, action.files);

        case Actions.REQUEST_CREATE_FILE:
            return requestCreate(state, null);

        case Actions.RECEIVE_CREATE_FILE:
            return receiveCreate(state, action.file);

        case Actions.REQUEST_DELETE_FILE:
            return requestDelete(state, null);

        case Actions.RECEIVE_DELETE_FILE:
            return receiveDelete(state, action.fileId);

        case Actions.REQUEST_DELETE_FILES:
            return requestDeleteFiles(state);

        case Actions.RECEIVE_DELETE_FILES:
            return receiveDeleteFiles(state, action.files)

        case Actions.REQUEST_MODULES:
            return requestModules(state);

        case Actions.RECEIVE_MODULES:
            return receiveModules(state, action.modules);

        case Actions.UPDATE_APP_DATA:
            return updateAppData(state, action.data);

        case Actions.UPDATE_FILE_STATE:
            return updateFileState(state, action.file);

        default:
            return state;
    }
}

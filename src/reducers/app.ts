import produce from "immer";
import {AppState} from "../types";
import {AppActions} from "../types/app";

const initState: AppState = {
	id: "",
	name: "",
	description: "",
	type: "",
	settings: null,
	updatedAt: 0,
	changedBy: "",
	createdAt: 0,
	createdBy: "",
	isFetching: false,
	fileSystemObjects: [],
	updateTree: false,
	isSaving: false,
	modules: [],
};

const requestWebApp = produce((draft, appId) => {
	draft.id = appId;
	draft.isFetching = true;
});

const receiveWebApp = produce((draft, app) => {
	return {...app, modules: []};
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

const requestModules = produce((draft) => {

});

const receiveModules = produce((draft, modules) => {
    console.log(modules);
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

export default function app(state = initState, action) {
	switch (action.type) {
		case AppActions.REQUEST_WEBAPP:
			return requestWebApp(state, action.id);
		case AppActions.RECEIVE_WEBAPP:
			return receiveWebApp(state, action.data);
		case AppActions.REQUEST_SAVE:
			return requestSave(state);
		case AppActions.RECEIVE_SAVE:
			return receiveSave(state, action.files);
		case AppActions.REQUEST_CREATE:
			return requestCreate(state);
		case AppActions.RECEIVE_CREATE:
			return receiveCreate(state, action.file);
		case AppActions.REQUEST_DELETE:
			return requestDelete(state);
		case AppActions.RECEIVE_DELETE:
			return receiveDelete(state, action.fileId);
		case AppActions.UPDATE_FILE_STATE:
			return updateFileState(state, action.file);
		case AppActions.REQUEST_MODULES:
			return requestModules(state);
		case AppActions.RECEIVE_MODULES:
			return receiveModules(state, action.modules);
		default:
			return state;
	}
}

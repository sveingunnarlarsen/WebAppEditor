import { Actions, AppEditorState, FileSystemObject } from "../types";
import { DialogType } from "../types/dialog";
import { syncFile, removeFile } from "../git";
import { fileCreated, fileDeleted, fileChanged } from "../completer";
import { getFileById } from "../store/utils";

import { closeFile } from "./editor";
import { throwError, handleAjaxError, handleClientError } from "./error";
import { extractFileMeta, destructFileServerProps, getFolderPathFromSelectedNode } from "./utils";

import { openDialog, updateEditors } from "./";

const headers = {
    "Content-Type": "application/json"
};

export function save(filesToSave: FileSystemObject[] = []) {
    return function(dispatch, getState) {
        dispatch(requestSave());

        const app = getState().app;
        let shouldUpdateEditors = false;

        if (filesToSave.length < 1) {
            filesToSave = getState().app.fileSystemObjects.filter(f => f.modified);
        } else {
            shouldUpdateEditors = true;
        }
        if (filesToSave.length < 1) return;

        return fetch(`/api/webapp/${app.id}/fso?fetch=true`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
                fileSystemObjects: filesToSave.map(f => destructFileServerProps(f))
            })
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const files = json.fileSystemObjects
                        .map(f => extractFileMeta(f, getState().app.fileSystemObjects, json.fileSystemObjects))
                        .sort((a, b) => {
                            const aFirst = (a.path.split('/').length > b.path.split('/').length);
                            return aFirst ? 1 : -1;
                        });

                    for (let i = 0; i < files.length; i++) {
                        const originalFso = getFileById(files[i].id);
                        await syncFile(files[i], originalFso);
                        await fileChanged(files[i], originalFso);
                    }
                    dispatch(receiveSave(files));
                    if (shouldUpdateEditors) {
                        dispatch(updateEditors());
                    }
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    };
}

export function createFsos(fileSystemObjects: FileSystemObject[]) {
    return function(dispatch, getState) {
        dispatch(requestCreateFiles());

        return fetch(`/api/webapp/${getState().app.id}/fso?fetch=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                fileSystemObjects,
            })
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const files = json.fileSystemObjects.map(f => extractFileMeta(f, getState().app.fileSystemObjects, json.fileSystemObjects));
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        await syncFile(file);
                        await fileCreated(file.path, file.type, file.content);
                    }
                    dispatch(receiveCreateFiles(files));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function deleteFsos(fileSystemObjects: FileSystemObject[]) {
    return function(dispatch, getState) {
        dispatch(requestDeleteFiles())

        fileSystemObjects.forEach(f => {
            dispatch(closeFile(f.id));
        })

        return fetch(`/api/webapp/${getState().app.id}/fso`, {
            method: "DELETE",
            headers,
            body: JSON.stringify({
                fileSystemObjectIds: fileSystemObjects.map(f => f.id)
            })
        })
            .then(throwError)
            .then(async () => {
                const files = fileSystemObjects;
                try {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        await removeFile(file.id);
                        const fso = getFileById(file.id);
                        await fileDeleted(fso.path, fso.type);
                    }
                    dispatch(receiveDeleteFiles(files));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function saveFso(fileSystemObject: FileSystemObject) {
    return function(dispatch, getState) {
        dispatch(requestSave());

        return fetch(`/api/webapp/${getState().app.id}/fso/${fileSystemObject.id}?fetch=true`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
                fileSystemObject: destructFileServerProps(fileSystemObject)
            })
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const file = extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects);

                    const originalFso = getFileById(file.id);
                    await syncFile(file, originalFso);
                    await fileChanged(file, originalFso);

                    dispatch(receiveSave([file]));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    };
}

export function createFso({ type = 'file', content, path, name }: { type: 'file' | 'folder', content?: string, path?: string, name?: string }) {
    return function(dispatch, getState: () => AppEditorState) {
        dispatch(requestCreateFile());

        const id = getState().app.id;

        if (!id) {
            return dispatch(openDialog(DialogType.MESSAGE, { message: "No open project" }));
        }

        if (!path) {
            path = `${getFolderPathFromSelectedNode(getState)}${name}`;
        }        

        if (getState().app.fileSystemObjects.find(f => f.path === path)) {
            return dispatch(openDialog(DialogType.MESSAGE, { message: "File already exists" }));
        }

        const fileSystemObject = {
            content: content ? content : "",
            path,
            type
        }

        return fetch(`/api/webapp/${id}/fso?fetch=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                fileSystemObject,
            })
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const file = extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects);
                    await syncFile(file);
                    await fileCreated(file.path, file.type, file.content);
                    dispatch(receiveCreateFile(file));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function deleteFso(id?: string) {
    return function(dispatch, getState) {
        dispatch(requestDeleteFile())
        if (!id) {
            id = getState().selectedNode;
        }

        dispatch(closeFile(id));
        const fso = getFileById(id);

        return fetch(`/api/webapp/${getState().app.id}/fso/${id}`, {
            method: "DELETE"
        })
            .then(throwError)
            .then(async () => {
                try {
                    await removeFile(id);
                    await fileDeleted(fso.path, fso.type);
                    dispatch(receiveDeleteFile(id));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function deleteFolder() {
    return function(dispatch, getState) {
        let fsos;
        try {
            const selectedFolder = getFileById(getState().selectedNode);
            fsos = getState().app.fileSystemObjects.filter(f => f.path.indexOf(selectedFolder.path + "/") === 0);
            fsos.push(selectedFolder);
        } catch (e) {
            return handleClientError(e, dispatch);
        }
        return dispatch(deleteFsos(fsos));
    };
}

export function renameFolder(newName: string) {
    return function(dispatch, getState) {
        let updatedFsos = [];
        try {
            const selectedFolder = getFileById(getState().selectedNode);
            const fsos = getState().app.fileSystemObjects.filter(f => f.path.indexOf(selectedFolder.path + "/") === 0);
            fsos.push(selectedFolder);
            const newFolderPath = `${selectedFolder.path.split("/").slice(0, -1).join("/")}/${newName}`;

            for (var i = 0; i < fsos.length; i++) {
                updatedFsos.push({ ...fsos[i], path: fsos[i].path.replace(selectedFolder.path, newFolderPath) });
            }
        } catch (e) {
            return handleClientError(e, dispatch);
        }
        return dispatch(save(updatedFsos));
    };
}

export function updateFileState(file) {
    return {
        type: Actions.UPDATE_FILE_STATE,
        file
    };
}

function requestSave() {
    return {
        type: Actions.REQUEST_SAVE
    };
}

function receiveSave(files) {
    return {
        type: Actions.RECEIVE_SAVE,
        files
    };
}

function requestCreateFiles() {
    return {
        type: Actions.REQUEST_CREATE_FILES
    }
}

function receiveCreateFiles(files) {
    return {
        type: Actions.RECEIVE_CREATE_FILES,
        files,
    }
}

function requestDeleteFiles() {
    return {
        type: Actions.REQUEST_DELETE_FILES
    }
}

function receiveDeleteFiles(files) {
    return {
        type: Actions.RECEIVE_DELETE_FILES,
        files,
    }
}

function requestCreateFile() {
    return {
        type: Actions.REQUEST_CREATE_FILE,
    }
}

function receiveCreateFile(file) {
    return {
        type: Actions.RECEIVE_CREATE_FILE,
        file
    }
}

function requestDeleteFile() {
    return {
        type: Actions.REQUEST_DELETE_FILE,
    }
}

function receiveDeleteFile(fileId) {
    return {
        type: Actions.RECEIVE_DELETE_FILE,
        fileId
    }
}
import {Actions} from "../types";
import {DialogType} from "../types/dialog";
import {syncFile, removeFile} from "../git";
import {openDialog} from "./";
import {closeFile} from "./editor";
import {throwError, handleAjaxError} from "./error";
import {extractFileMeta, destructFileServerProps, getFolderPath} from "./utils";
import {getFileById} from "../store/utils";

const headers = {
	"Content-Type": "application/json"
};

export function save(filesToSave? = []) {
	return function(dispatch, getState) {
		dispatch(requestSave());

		const app = getState().app;
		if (filesToSave.length < 1) {
			filesToSave = getState().app.fileSystemObjects.filter(f => f.modified);
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
			.then(response => response.json())
			.then(json => json.fileSystemObjects.map(f => extractFileMeta(f, getState().app.fileSystemObjects, json.fileSystemObjects)))
			.then(async files => {
			    for (let i = 0; i < files.length; i++) {
			        await syncFile(files[i]);
			    }
			    return files;
			})
			.then(files => dispatch(receiveSave(files)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function createFsos(fileSystemObjects) {
    return function(dispatch, getState) {
        dispatch(requestCreateFiles());
        
        console.log("In create fsos: ", fileSystemObjects);
        
        return fetch(`/api/webapp/${getState().app.id}/fso?fetch=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                fileSystemObjects,
            })
        })
            .then(throwError)
            .then(response => response.json())
            .then(json => json.fileSystemObjects.map(f => extractFileMeta(f, getState().app.fileSystemObjects, json.fileSystemObjects)))
            .then(files => {
                files.forEach(file => syncFile(file));
                return files;
            })
            .then(files => dispatch(receiveCreateFiles(files)))
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function deleteFsos(fileSystemObjects) {
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
            .then(() => {
                return fileSystemObjects.forEach(file => removeFile(file.id));
            })
            .then(() => dispatch(receiveDeleteFiles(fileSystemObjects)))
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function saveFso(fileSystemObject) {
	return function(dispatch, getState) {
		dispatch(requestSave());

		return fetch(`/api/webapp/${fso.webAppId}/fso/${fso.id}?fetch=true`, {
			method: "PATCH",
			headers,
			body: JSON.stringify({
				fileSystemObject: destructFileServerProps(fso)
			})
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => {
			    syncFile(file);
			    return file;
			})
			.then(file => dispatch(receiveSave([file])))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function createFso({type = 'file', content, path, name}: {type: 'file' | 'folder', content?: string, path?: string, name?: string}) {
    return function(dispatch, getState) {
        dispatch(requestCreateFile());
        
        const id = getState().app.id;
        
        if (!id) {
            return dispatch(openDialog(DialogType.MESSAGE, {message: "No open project"}));
        }
        
        if (!path) {
			const folderPath = getFolderPath(getState().selectedNode, getState().app.fileSystemObjects);
			path = `${folderPath ? folderPath : ``}/${name}`;
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
			.then(response => response.json())
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => {
			    syncFile(file);
			    return file;
			})
			.then(file => dispatch(receiveCreateFile(file)))
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
        
        return fetch(`/api/webapp/${getState().app.id}/fso/${id}`, {
            method: "DELETE"
        })
            .then(throwError)
            .then(() => {
                return removeFile(id);
            })
            .then(() => dispatch(receiveDeleteFile(id)))
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function deleteFolder() {
	return function(dispatch, getState) {
		const selectedFolder = getFileById(getState().selectedNode);
		const fsos = getState().app.fileSystemObjects.filter(f => f.path.indexOf(selectedFolder.path + "/") === 0);
		fsos.push(selectedFolder);
		return dispatch(deleteFsos(fsos));
	};
}

export function renameFolder(newName) {
	return function(dispatch, getState) {
	    const selectedFolder = getFileById(getState().selectedNode);
	    const fsos = getState().app.fileSystemObjects.filter(f => f.path.indexOf(selectedFolder.path + "/") === 0);
	    fsos.push(selectedFolder);
	    const newFolderPath = `${selectedFolder.path.split("/").slice(0, -1).join("/")}/${newName}`;
	    const updatedFsos = [];

		for (var i = 0; i < fsos.length; i++) {
			updatedFsos.push({...fsos[i], path: fsos[i].path.replace(selectedFolder.path, newFolderPath)});
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







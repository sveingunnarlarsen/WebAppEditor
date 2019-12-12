import {AppActions} from "../types/app";
import {extractFileMeta, extractServerProps, getFolderPath, convertApiWebAppData} from "./utils";
import {closeFile, closeAllTabs} from "./editor";
import {syncFile} from "../git";

export function fetchWebApp(id: string) {
	return function(dispatch, getState) {
	    if (id !== getState().app.id) {
	        dispatch(closeAllTabs());
	    }
		dispatch(requestWebApp(id));

		return fetch("/api/webapp/" + id)
			.then(response => response.json(), error => console.log("An error occured", error)) //TODO: Error dispatch
			.then(json => convertApiWebAppData(json))
			.then(app => dispatch(receiveWebApp(app)))
			.catch(error => console.log("Error in fetchWebApp", error)); //TODO: Error dispatch
	};
}

export function save() {
	return function(dispatch, getState) {
		dispatch(requestSave());

		const app = getState().app;
		const filesToSave = getState().app.fileSystemObjects.filter(f => f.modified);
		if (filesToSave.length < 1) return; 
		return fetch("/api/webapp/" + app.id + "/fso?fetch=true", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				fileSystemObjects: filesToSave.map(f => extractServerProps(f))
			})
		})
			.then(response => response.json(), error => console.log("An error occured", error))
			.then(json => json.fileSystemObjects.map(f => extractFileMeta(f, getState().app.fileSystemObjects)))
			.then(files => dispatch(receiveSave(files)));
	};
}

export function saveApp(data) {
    return function(dispatch, getState) {
        dispatch(requestSave());
        
        const app = getState().app;
        return fetch("/api/webapp")
    }
}

export function saveFile(fso) {
	return function(dispatch, getState) {
		dispatch(requestSave());

		return fetch("/api/webapp/" + fso.webAppId + "/fso/" + fso.id + "?fetch=true", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				fileSystemObject: extractServerProps(fso)
			})
		})
			.then(response => response.json(), error => console.log("An error occured", error)) //TODO: Error dispatch
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => dispatch(receiveSave([file])))
			.catch(error => console.log("Error in fileSave", error)); //TODO: Error dispatch
	};
}

export function createFile(fileName, type: string = "file") {
	return function(dispatch, getState) {
		dispatch(requestCreate());

		const folderPath = getFolderPath(getState().selectedNode, getState().app.fileSystemObjects);
		const fso = {
			content: "",
			path: folderPath + "/" + fileName,
			type,
			webAppId: getState().app.id
		};

		return fetch("/api/webapp/" + fso.webAppId + "/fso?fetch=true", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				fileSystemObject: fso
			})
		})
			.then(response => response.json(), error => console.log("An error occured", error)) //TODO: Error dispatch
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => dispatch(receiveCreate(file)))
			.catch(error => console.log("Error in file create", error));
	};
}

export function deleteFile() {
	return function(dispatch, getState) {
		dispatch(requestDelete());
		const webAppId = getState().app.id;
		const fileId = getState().selectedNode;
		dispatch(closeFile(fileId));

		return fetch("/api/webapp/" + webAppId + "/fso/" + fileId, {
			method: "DELETE"
		}).then(response => dispatch(receiveDelete(fileId)), error => console.log("An error occured", error));
	};
}


export function requestWebApp(id) {
	return {
		type: AppActions.REQUEST_WEBAPP,
		id
	};
}

export function receiveWebApp(data) {
	return {
		type: AppActions.RECEIVE_WEBAPP,
		receivedAt: Date.now(),
		data
	};
}

export function requestSave() {
	return {
		type: AppActions.REQUEST_SAVE
	};
}

export function receiveSave(files) {
	return {
		type: AppActions.RECEIVE_SAVE,
		files
	};
}

export function requestCreate() {
	return {
		type: AppActions.REQUEST_CREATE
	};
}

export function receiveCreate(file) {
	return {
		type: AppActions.RECEIVE_CREATE,
		file
	};
}

export function requestDelete() {
	return {
		type: AppActions.REQUEST_DELETE
	};
}

export function receiveDelete(fileId) {
	return {
		type: AppActions.RECEIVE_DELETE,
		fileId
	};
}

export function updateFileState(file) {
    syncFile(file);
	return {
		type: AppActions.UPDATE_FILE_STATE,
		file
	};
}
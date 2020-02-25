import {AppActions} from "../types/app";
import {extractFileMeta, extractServerProps, getFolderPath, convertApiWebAppData} from "./utils";
import {closeFile, closeAllTabs} from "./editor";
import {syncFile, removeFile, cloneGitRepo} from "../git";
import {openDialog} from "./";
import {DialogType} from "../types/dialog";
import {throwError} from "./ajax";


async function handleAppError(error, dispatch) {
    const json = await error.json()
	return dispatch(openDialog(DialogType.COMPILE_ERROR, json.status));
}

export function saveAppData() {
    return function(dispatch, getState) {
        
        const app = getState().app;
        
        return fetch("/api/webapp/" + getState().app.id, {
            method: "PATCH",
			headers: {
			    "Content-Type": "application/json"
			},
			body: JSON.stringify({
		        app: {
		            id: app.id,
		            name: app.name,
		            type: app.type,
		            description: app.description,
		            settings: app.settings,
		        }
			}),
        })
            .then(throwError)
            .then(response => response.json(), error => console.log("Failed to connect", error))
            .then()
        
    }
}

export function fetchNpmModules() {
	return function(dispatch, getState) {
		dispatch(requestModules());

		return fetch("/api/webapp/" + getState().app.id + "/npm")
		    .then(throwError)
			.then(response => response.json(), error => console.log("An error occured", error))
			.then(json => dispatch(receiveModules(json)))
			.catch(error => console.log("Error in fetch modules", error));
	};
}

export function installNpmModules() {
	return function(dispatch, getState) {
		dispatch(requestModules());

		return fetch("/api/webapp/" + getState().app.id + "/npm", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			}
		})
		    .then(throwError)
			.then(response => response.json())
			.then(json => {console.log("feth didn't throw"); return json;})
			.then(json => dispatch(receiveModules(json)))
			.catch(error => handleAppError(error, dispatch))
	};
}

export function deleteNpmModules() {
	return function(dispatch, getState) {
		// dispatch(requestModules)

		return fetch("/api/webapp/" + getState().app.id + "/npm", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => response.json(), error => console.log("An error occured", error))
			.then(json => dispatch(receiveModules(json)))
			.catch(error => console.log("Error deleting modules", error));
	};
}

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
			.then(() => dispatch(fetchNpmModules()))
			.catch(error => console.log("Error in fetchWebApp", error)); //TODO: Error dispatch
	};
}

export function createProject(opts) {
	return function(dispatch, getState) {
		if (opts.remote) {
			return fetch("/api/webapp?fetch=true", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					app: {
						type: opts.type,
						name: opts.name,
						description: opts.description,
						settings: {
							entryPoint: {
								javascript: "",
								html: ""
							},
							git: {
								repo: opts.remote,
								branch: "master"
							},
							projectFolder: null
						}
					}
				})
			})
				.then(response => response.json(), error => console.log("An error occured", error))
				.then(json => convertApiWebAppData(json))
				.then(app => dispatch(receiveWebApp(app)))
				.then(() => cloneGitRepo())
				.catch(error => console.log("Error in createProject from git repo", error));
		} else {
			return fetch("/api/webapp?fetch=true", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					template: "react",
					app: {
						type: opts.type,
						name: opts.name,
						description: opts.description,
						settings: {
							repo: "",
							branch: "master",
							projectFolder: null
						}
					}
				})
			})
				.then(response => response.json(), error => console.log("An error occured", error))
				.then(json => convertApiWebAppData(json))
				.then(app => dispatch(receiveWebApp(app)))
				.catch(error => console.log("Error in createProject", error));
		}
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

export function create(fsos) {
	return function(dispatch, getState) {
		const app = getState().app;

		return fetch("/api/webapp/" + app.id + "/fso?fetch=true", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				fileSystemObjects: fsos
			})
		})
			.then(response => response.json(), error => console.log("AN error occured", error))
			.then(json =>
				convertApiWebAppData({
					app: {
						...getState().app,
						fileSystemObjects: json.fileSystemObjects
					}
				})
			)
			.then(app => dispatch(receiveWebApp(app)))
			.catch(error => console.log("An error occured: ", error));
	};
}

export function saveApp(data) {
	return function(dispatch, getState) {
		dispatch(requestSave());

		const app = getState().app;
		return fetch("/api/webapp");
	};
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
			type
		};

		return fetch("/api/webapp/" + getState().app.id + "/fso?fetch=true", {
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

export function requestModules() {
	return {
		type: AppActions.REQUEST_MODULES
	};
}

export function receiveModules(modules) {
	return {
		type: AppActions.RECEIVE_MODULES,
		modules
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
	syncFile(file);
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
	removeFile(fileId);
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

export function updateAppData(data) {
    return {
        type: AppActions.UPDATE_APP_DATA,
        data,
    }
}






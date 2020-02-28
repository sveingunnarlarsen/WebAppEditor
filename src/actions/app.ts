import {AppActions} from "../types/app";
import {extractFileMeta, extractServerProps, getFolderPath, convertApiWebAppData} from "./utils";
import {closeFile, closeAllTabs} from "./editor";
import {syncFile, removeFile, cloneGitRepo} from "../git";
import {openDialog} from "./";
import {DialogType} from "../types/dialog";
import {throwError, handleAjaxError} from "./ajax";
import {startClone, endClone} from "./"

const headers = {
	"Content-Type": "application/json"
};

export function saveAppData() {
	return function(dispatch, getState) {
		const app = getState().app;

		return fetch(`/api/webapp/${app.id}`, {
			method: "PATCH",
			headers,
			body: JSON.stringify({
				app: {
					id: app.id,
					name: app.name,
					type: app.type,
					description: app.description,
					settings: app.settings
				}
			})
		})
			.then(throwError)
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function fetchNpmModules() {
	return function(dispatch, getState) {
		dispatch(requestModules());

		return fetch(`/api/webapp/${getState().app.id}/npm`)
			.then(throwError)
			.then(response => response.json())
			.then(json => dispatch(receiveModules(json)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

function updatePackageJson(value, getState, dispatch) {
    const packageJson = getState().app.fileSystemObjects.find(f => f.path === '/package.json');
    packageJson.content = value;
    dispatch(saveFile(packageJson));
}

export function installNpmModules(runUpgrade: boolean) {
	return function(dispatch, getState) {
		dispatch(startUpdateModules());

		return fetch(`/api/webapp/${getState().app.id}/npm${runUpgrade ? '?upgrade=true' : ''}`, {
			method: "PUT",
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => {
                updatePackageJson(json.packageJson, getState, dispatch);
                return json;
			})
			.then(json => dispatch(openDialog(DialogType.SERVER_MESSAGE, {type: "npm", json})))
			.then(() => dispatch(fetchNpmModules()))
			.catch(error => handleAjaxError(error, dispatch))
			.finally(() => dispatch(endUpdateModules()));
	};
}

export function deleteNpmModules() {
	return function(dispatch, getState) {
		dispatch(requestDeleteModules());

		return fetch(`/api/webapp/${getState().app.id}/npm`, {
			method: "DELETE",
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => dispatch(receiveDeleteModules()))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function fetchWebApp(id: string) {
	return function(dispatch, getState) {
		if (id !== getState().app.id) {
			dispatch(closeAllTabs());
		}
		dispatch(requestWebApp(id));

		return fetch(`/api/webapp/${id}`)
			.then(throwError)
			.then(response => response.json())
			.then(json => convertApiWebAppData(json))
			.then(app => dispatch(receiveWebApp(app)))
			.then(() => dispatch(fetchNpmModules()))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function createProject(opts) {
	return function(dispatch, getState) {
		if (opts.remote) {
		    dispatch(startClone());
			return fetch(`/api/webapp?fetch=true`, {
				method: "POST",
				headers,
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
				.then(throwError)
				.then(response => response.json())
				.then(json => convertApiWebAppData(json))
				.then(app => dispatch(receiveWebApp(app)))
				.then(() => cloneGitRepo(opts.remote))
				.catch(error => handleAjaxError(error, dispatch));
		} else {
			return fetch(`/api/webapp?fetch=true`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					template: "react",
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
				.then(throwError)
				.then(response => response.json())
				.then(json => convertApiWebAppData(json))
				.then(app => dispatch(receiveWebApp(app)))
				.catch(error => handleAjaxError(error, dispatch));
		}
	};
}

export function save() {
	return function(dispatch, getState) {
		dispatch(requestSave());

		const app = getState().app;
		const filesToSave = getState().app.fileSystemObjects.filter(f => f.modified);
		if (filesToSave.length < 1) return;

		return fetch(`/api/webapp/${app.id}/fso?fetch=true`, {
			method: "PATCH",
			headers,
			body: JSON.stringify({
				fileSystemObjects: filesToSave.map(f => extractServerProps(f))
			})
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => json.fileSystemObjects.map(f => extractFileMeta(f, getState().app.fileSystemObjects)))
			.then(files => dispatch(receiveSave(files)))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function create(fsos) {
	return function(dispatch, getState) {
		const app = getState().app;

		return fetch(`/api/webapp/${app.id}/fso?fetch=true`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				fileSystemObjects: fsos
			})
		})
			.then(throwError)
			.then(response => response.json())
			.then(json =>
				convertApiWebAppData({
					app: {
						...getState().app,
						fileSystemObjects: json.fileSystemObjects
					}
				})
			)
			.then(app => dispatch(receiveWebApp(app)))
			.catch(error => handleAjaxError(error, dispatch))
			.finally(() => dispatch(endClone()));
	};
}

export function saveFile(fso) {
	return function(dispatch, getState) {
		dispatch(requestSave());

		return fetch(`/api/webapp/${fso.webAppId}/fso/${fso.id}?fetch=true`, {
			method: "PATCH",
			headers,
			body: JSON.stringify({
				fileSystemObject: extractServerProps(fso)
			})
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => dispatch(receiveSave([file])))
			.catch(error => handleAjaxError(error, dispatch));
	};
}

export function createFile(fileName, type: string = "file") {
	return function(dispatch, getState) {
		dispatch(requestCreate());

		const folderPath = getFolderPath(getState().selectedNode, getState().app.fileSystemObjects);

		const fso = {
			content: "",
			path: `${folderPath}/${fileName}`,
			type
		};

		return fetch(`/api/webapp/${getState().app.id}/fso?fetch=true`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				fileSystemObject: fso
			})
		})
			.then(throwError)
			.then(response => response.json())
			.then(json => extractFileMeta(json.fileSystemObject, getState().app.fileSystemObjects))
			.then(file => dispatch(receiveCreate(file)))
			.catch(error => handleAjaxError(error, dispatch));
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
		}).then(response => dispatch(receiveDelete(fileId)), error => handleAjaxError(error, dispatch));
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

export function startUpdateModules() {
	return {
		type: AppActions.START_MODULE_UPDATE
	};
}

export function endUpdateModules(result) {
	return {
		type: AppActions.END_MODULE_UPDATE,
		result
	};
}

export function requestDeleteModules() {
	return {
		type: AppActions.REQUEST_DELETE_MODULES
	};
}

export function receiveDeleteModules() {
	return {
		type: AppActions.RECEIVE_DELETE_MODULES
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
	// If we receive only one file it was probably renmaed and must be synced with git.
	if (files.length === 1) {
		syncFile(files[0]);
	}
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
		data
	};
}

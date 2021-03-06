import { Actions, AppSettings, project, CompilationDetails, AppEditorState } from "../types";
import { DialogType } from "../types/dialog";
import { Api } from "../types/resources";
import { cloneGitRepo, deleteGitRepo } from "../git";
import { loadProject } from "../monaco"
import { getNpmModules } from "./npm";
import { throwError, handleAjaxError, handleCompileError, handleClientError } from "./error";
import { convertApiWebAppData, destructAppServerProps } from "./utils";
import { reset, openDialog } from "./";

const headers = {
    "Content-Type": "application/json"
};


export function getMasterData() {
    return function(dispatch) {
        dispatch(requestMasterData());

        return fetch(`/api/editor/data`)
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    dispatch(receiveMasterData(json));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    };
}

export function getWebApps() {
    return function(dispatch, getState) {
        dispatch(requestWebApps());

        return fetch(`/api/webapp`)
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    dispatch(receiveWebApps(json.apps));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

export function createProject({ type, template, name, description, remote }: project) {
    return function(dispatch, getState) {
        dispatch(reset());
        dispatch(requestCreateWebApp());

        return createApp({ type, template, name, description, remote })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const app = convertApiWebAppData(json);
                    dispatch(receiveWebApp(app));
                    dispatch(setAppLock(true));
                    dispatch(getNpmModules());
                    loadProject(getState);
                    if (remote) {
                        cloneGitRepo(remote);
                        return;
                    }
                    if (template) {
                        dispatch(compilePreview());
                        dispatch(compileProject());
                    }
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

export function getProject(id: string, lock: boolean = false) {
    return function(dispatch, getState) {
        if (id !== getState().app.id) {
            dispatch(reset());
        }
        dispatch(requestWebApp(id));

        return fetch(`/api/webapp/${id}`)
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    const app = convertApiWebAppData(json);
                    dispatch(receiveWebApp(app));
                    loadProject(getState);
                    dispatch(getNpmModules());
                    dispatch(getCompilationDetails());
                    dispatch(setAppLock(lock));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

export function deleteProject() {
    return function(dispatch, getState) {
        const id = getState().app.id;

        if (!id) {
            return dispatch(openDialog(DialogType.MESSAGE, { message: "No open project" }));
        }

        dispatch(requestDeleteWebApp());

        return fetch(`/api/webapp/${id}`, {
            method: "DELETE"
        })
            .then(throwError)
            .then(async response => {
                try {
                    await deleteGitRepo();
                    dispatch(reset());
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

export function toggleToEdit() {
    return function(dispatch, getState) {

        const app = getState().app;

        return fetch('/api/functions/Locking/Lock', {
            method: "POST",
            headers,
            body: JSON.stringify({
                objectType: "App Editor",
                objectID: app.id,
                objectKey: app.name,
            })
        })
            .then(throwError)
            .then(async response => {
                try {
                    const json = await response.json();
                    if (json.object) {
                        dispatch(openDialog(DialogType.APP_LOCKED, json.object));
                    } else {
                        dispatch(getProject(app.id, true));
                    }
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))

    }
}

export function toggleToDisplay(forceLock: boolean = false) {
    return function(dispatch, getState) {

        const app = getState().app;

        return fetch('/api/functions/Locking/Unlock', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                objectType: "App Editor",
                objectID: app.id,
                objectKey: app.name,
            })
        })
            .then(throwError)
            .then(async () => {
                if (forceLock) {
                    console.log("Toggle to edit");
                    dispatch(toggleToEdit());
                } else {
                    dispatch(getProject(app.id, false));
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

export function saveAppData(compileApi: boolean = false) {
    return function(dispatch, getState) {
        return fetch(`/api/webapp/${getState().app.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
                app: destructAppServerProps(getState().app)
            })
        })
            .then(throwError)
            .then(() => compileApi ? dispatch(compileApiDefinitions()) : null)
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function compileApiDefinitions() {
    return function(dispatch, getState) {
        return fetch(`/api/webapp/${getState().app.id}/compileApiDefinitions`, {
            method: "POST",
            headers,
        })
            .then(throwError)
            .catch(error => handleAjaxError(error, dispatch));
    }
}

export function compileProject() {
    return function(dispatch, getState) {
        dispatch(requestCompile());

        return fetch(`/api/webapp/${getState().app.id}/deploy`, {
            method: "POST"
        })
            .then(throwError)
            .then(() => dispatch(getCompilationDetails()))
            .catch(error => handleCompileError(error, dispatch))
            .finally(() => dispatch(receiveCompile()));
    };
}

export function getCompilationDetails() {
    return function(dispatch, getState) {
        return fetch(`/api/webapp/${getState().app.id}/stats`, {
            method: "GET"
        })
            .then(throwError)
            .then(r => <CompilationDetails><unknown>r.json())
            .then((response) => dispatch(receiveCompilationDetails(response)))
            .catch(error => handleAjaxError(error, dispatch))
    };
}

export function compilePreview() {
    return function(dispatch, getState) {
        dispatch(requestCompile());

        return fetch(`/api/webapp/${getState().app.id}/preview`, {
            method: "POST"
        })
            .then(throwError)
            .then(() => dispatch(getCompilationDetails()))
            .catch(error => handleCompileError(error, dispatch))
            .finally(() => dispatch(receiveCompile()));
    };
}

export function signOut() {
    return function(dispatch, getState: () => AppEditorState) {
        if (getState().app.lock) {
            dispatch(toggleToDisplay());
        }
        return fetch(`/user/logout`, {
            method: "POST",
        })
            .then(throwError)
            .then(() => location.reload())
            .catch(error => handleAjaxError(error, dispatch))

    }
}

export function updateAppApis(apis: Api[]) {
    return {
        type: Actions.UPDATE_APP_APIS,
        apis,
    }
}

export function updateAppData(data: { name: string, description: string, type: 'react' | 'vue', settings: AppSettings }) {
    return {
        type: Actions.UPDATE_APP_DATA,
        data,
    }
}

function setAppLock(lock: boolean) {
    return {
        type: Actions.SET_APP_LOCK,
        lock,
    }
}

function requestMasterData() {
    return {
        type: Actions.REQUEST_MASTERDATA
    };
}

function receiveMasterData(data) {
    return {
        type: Actions.RECEIVE_MASTERDATA,
        receivedAt: Date.now(),
        data
    };
}

function requestWebApps() {
    return {
        type: Actions.REQUEST_WEBAPPS
    };
}

function receiveWebApps(data) {
    return {
        type: Actions.RECEIVE_WEBAPPS,
        receivedAt: Date.now(),
        data
    };
}

function requestCreateWebApp() {
    return {
        type: Actions.REQUEST_CREATE_WEBAPP
    }
}

function requestDeleteWebApp() {
    return {
        type: Actions.REQUEST_DELETE_WEBAPP
    }
}

function requestWebApp(id) {
    return {
        type: Actions.REQUEST_WEBAPP,
        id,
    }
}

function receiveWebApp(data) {
    return {
        type: Actions.RECEIVE_WEBAPP,
        receivedAt: Date.now(),
        data,
    }
}

function requestCompile() {
    return {
        type: Actions.REQUEST_COMPILE
    };
}

function receiveCompile() {
    return {
        type: Actions.RECEIVE_COMPILE
    };
}

function receiveCompilationDetails(compilationDetails: CompilationDetails) {
    return {
        type: Actions.RECEIVE_DEV_COMPILATION_DETAILS,
        compilationDetails: compilationDetails
    }
}

function createApp({ type, template, name, description, remote }: project) {
    return fetch(`/api/webapp?fetch=true`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            template: remote ? null : template,
            app: {
                type,
                name,
                description,
                settings: {
                    entryPoint: {
                        javascript: "/src/index.js",
                        html: "/public/index.html",
                    },
                    git: {
                        repo: remote ? remote : null,
                        branch: "master"
                    },
                    projectFolder: null,
                }
            }
        })
    })
}

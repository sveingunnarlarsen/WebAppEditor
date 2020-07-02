import store from "../store";
import { DialogType } from "../types/dialog";
import { openDialog, cancelSnackbars } from "./";

export function throwError(response: Response): Response {
    if (!response.ok) {
        throw response;
    }
    return response;
}

export async function handleAjaxError(error: any, dispatch?) {
    if (!dispatch) {
        dispatch = store.dispatch;
    }
    dispatch(cancelSnackbars());
    console.log("In handle ajax error", error);
    const status = error.status;
    try {
        const jsonError = await error.json();
        return dispatch(openDialog(DialogType.AJAX_ERROR, { status, error, jsonError }));
    } catch (e) {
        return dispatch(openDialog(DialogType.AJAX_ERROR, { status, error, jsonError: null }));
    }
}

export async function handleClientError(error: any, dispatch) {
    console.log("In handle client error", error);
    return dispatch(openDialog(DialogType.CLIENT_ERROR, { error }));
}

export async function handleCompileError(error, dispatch) {
    const reader = error.body.getReader();
    const part = await reader.read();
    const value = part.value;
    const decoder = new TextDecoder("utf-8");
    const html = decoder.decode(value);
    return dispatch(openDialog(DialogType.COMPILE_ERROR, html));
}
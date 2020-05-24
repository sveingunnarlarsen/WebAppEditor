import { DialogType } from "../types/dialog";

import { openDialog } from "./";

export function throwError(response) {
    if (!response.ok) {
        throw response;
    }
    return response;
}

export async function handleAjaxError(error: any, dispatch) {
    console.log("In handle ajax error", error);
    const status = error.status;
    try {
        const json = status ? await error.json() : { status: "Request failed. No connection to server." };
        return dispatch(openDialog(DialogType.AJAX_ERROR, { status, json }));
    } catch (e) {
        return dispatch(openDialog(DialogType.AJAX_ERROR, { status, json: `Error parsing error` }));
    }
}

export async function handleCompileError(error, dispatch) {
    const reader = error.body.getReader();
    const part = await reader.read();
    const value = part.value;
    const decoder = new TextDecoder("utf-8");
    const html = decoder.decode(value);
    return dispatch(openDialog(DialogType.COMPILE_ERROR, html));
}
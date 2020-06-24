import JSZip from "jszip";
import { extname } from "path";
import { saveAs } from 'file-saver';

import store from "../store";
import { Buffer } from "buffer";
import { throwError, handleAjaxError } from "../actions/error";
import { isImage } from "./utils";

export async function exportProjectToZip() {
    const zip = new JSZip();
    const app = store.getState().app;

    for (let i = 0; i < app.fileSystemObjects.length; i++) {
        const fso = app.fileSystemObjects[i];
        if (fso.type === "file") {
            if (isImage(fso.path)) {                
                zip.file(fso.path.substr(1), Buffer.from(fso.content, 'base64'));
            } else {
                zip.file(fso.path.substr(1), fso.content);
            }            
        } else {
            zip.folder(fso.path.substr(1));
        }
    }
    zip.generateAsync({ type: "blob" }).then(function(blob) {
        saveAs(blob, `${app.name}.zip`);
    });
}

export async function exportRuntime() {

    const app = store.getState().app;

    return fetch(`/api/webapp/${app.id}/export/runtime`, {
        method: "GET",
    })
        .then(throwError)
        .then(response => response.blob())
        .then(blob => saveAs(blob, `${app.name}.zip`))
        .catch(error => handleAjaxError(error, store.dispatch));
}
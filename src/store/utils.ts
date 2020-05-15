import store from "./";
import {FileSystemObject} from "../types"

export function getFileById(id: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.id === id);
}

export function getFileByPath(path: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.path === path);
}

export function getPrettierConfig() {
    const config = store.getState().app.fileSystemObjects.find(f => f.path === "/.prettierrc" || f.path === "/.prettierrc.json");
    if (config) {
        try {
            return JSON.parse(config.content);
        } catch (e) {
            console.log("Error parsing prettier config: ", e.message);
            return null;
        }
    }
    return null;
}
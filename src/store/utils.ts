import store from "./";
import {FileSystemObject} from "../types"

export function getFileById(id: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.id === id);
}

export function getFileByPath(path: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.path === path);
}
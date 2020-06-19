import store from "./";
import { FileSystemObject } from "../types"

export function getFileById(id: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.id === id);
}

export function getFileByPath(path: string): FileSystemObject {
    return store.getState().app.fileSystemObjects.find(f => f.path === path);
}

export function getFolderChildren(folder: FileSystemObject) {
    return store.getState().app.fileSystemObjects.filter(f => f.path.startsWith(`${folder.path}/`));
}
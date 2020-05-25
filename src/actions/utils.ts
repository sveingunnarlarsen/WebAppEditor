import { ServerFso, FileSystemObject, AppEditorState } from "../types";
import { getFileTypeImageData } from "../helpers/utils";

export function convertApiWebAppData(json: AppEditorState) {
    const app = json.app;
    const fsos = app.fileSystemObjects.map((f, i, array) => extractFileMeta(f, array));
    const folders = fsos.filter(f => f.type === "folder").sort((a, b) => (a.name > b.name ? 1 : -1));
    const files = fsos.filter(f => f.type === "file").sort((a, b) => (a.name > b.name ? 1 : -1));
    app.updateTree = true;
    app.fileSystemObjects = [...folders].concat([...files]);
    return app;
}

export function extractFileMeta(fso: ServerFso, fsos: FileSystemObject[], updatedFsos: FileSystemObject[] = []): FileSystemObject {
    let parentId;
    //Split path and remove first /, i.e. /folder/subFolder/file.txt
    const parts = fso.path.split("/");
    parts.shift();
    const name = parts.pop();
    const parentPath = "/" + parts.join("/");
    if (parentPath.length === 1) {
        parentId = "1";
    } else {
        const parent = updatedFsos.filter(f => f.path === parentPath)[0];
        if (parent) {
            parentId = parent.id
        } else {
            parentId = fsos.filter(f => f.path === parentPath)[0].id;
        }
    }
    if (fso.type === "file") {
        const splitFile = name.split(".");
        const fileType = splitFile.pop();
        const image = getFileTypeImageData(fileType);
        return Object.assign(fso, {
            name,
            value: name,
            fileType,
            parentId,
            image,
            disabled: false,
            orgContent: fso.content,
            modified: false
        });
    } else {
        return Object.assign(fso, {
            name,
            value: name,
            parentId,
            image: "",
            disabled: false
        });
    }
}

export function getFolderPathFromSelectedNode(getState: () => AppEditorState) {
    const id = getState().selectedNode;
    const fsos = getState().app.fileSystemObjects;

    const fso = fsos.find(f => f.id === id);
    if (fso && fso.type === "folder") {
        return fso.path + "/";
    } else if (fso && fso.type === "file") {
        const parts = fso.path.split("/");
        parts.shift();
        parts.pop();
        return "/" + parts.join("/") + "/";
    } else {
        return "/";
    }
}

export function destructFileServerProps({ id, path, type, webAppId, content, createdAt, updatedAt, createdBy, changedBy }) {
    return {
        id,
        path,
        type,
        webAppId,
        content,
    };
}

export function destructAppServerProps({ id, name, type, description, settings }) {
    return {
        id,
        name,
        type,
        description,
        settings,
    }
}

import { ServerFso, FileSystemObject, AppEditorState, AppSettings } from "../types";
import { getFileTypeImageData, sortFoldersAndFiles } from "../helpers/utils";

export function convertApiWebAppData(json: AppEditorState) {
    const app = json.app;

    // NOTE(Jorgen): For old apps that dont have these settings
    if (!app.settings) app.settings = { entryPoint: { html: null, javascript: null }, git: { repo: null, branch: null }, projectFolder: null };
    if (!app.settings.entryPoint) app.settings.entryPoint = { html: null, javascript: null };
    if (!app.settings.git) app.settings.git = { repo: null, branch: null };
    if (!app.settings.projectFolder) app.settings.projectFolder = null;

    const fsos = app.fileSystemObjects.map((f, i, array) => extractFileMeta(f, array));
    app.updateTree = true;
    app.fileSystemObjects = fsos.sort(sortFoldersAndFiles);

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
            const parent = fsos.filter(f => f.path === parentPath)[0];
            if (parent) {
                parentId = parent.id;
            } else {
                // The folder does not exist!!!
                parentId = "1";
            }
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
        if (parts.length > 0) {
            return "/" + parts.join("/") + "/";
        } else {
            return "/";
        }
    } else {
        return "/";
    }
}

export function destructFileServerProps({ id, path, type, webAppId, content, createdAt, updatedAt, createdBy, changedBy }: FileSystemObject) {
    //{ id: string; path: string; type: 'file' | 'folder'; webAppId: string; content: string; createdAt: string; updatedAt: string; createdBy: string; changedBy: string }) {
    return {
        id,
        path,
        type,
        webAppId,
        content,
    };
}

export function destructAppServerProps({ id, name, type, description, settings }: { id: string; name: string; type: 'file' | 'folder', description: string; settings: AppSettings }) {
    return {
        id,
        name,
        type,
        description,
        settings,
    }
}

import * as _ from "underscore";
import store from "../store";
import monaco from "./monaco";
import { FileSystemObject, AppEditorState } from "../types";
import { updateFileState } from "../actions/file";
import { getFileByPath } from "../store/utils";
import { fileUpdated } from "../completer";

const onModelContentChanged = _.debounce((model: monaco.editor.ITextModel) => {
    updateModel(model);
}, 500);

function disposeAllModels() {
    monaco.editor.getModels().forEach(model => {
        model.dispose();
    });
}

export function getModel(path) {
    return monaco.editor.getModel(monaco.Uri.parse(path));
}

export function createModel(fso: { type: 'file' | 'folder', content: string, path: string }) {
    if (fso.type === 'file') {        
        const language: string | null = fso.path.endsWith(".tsx") ? "typescript_react" : fso.path.endsWith(".ts") ? "typescript" : null;
        const model = monaco.editor.createModel(fso.content, language, monaco.Uri.parse(fso.path));
        model.onDidChangeContent(() => {
            onModelContentChanged(model);
        });
    }
}

export function deleteModel(path: string) {
    monaco.editor.getModel(monaco.Uri.parse(path)).dispose();
}

export function updateModel(model) {
    let modified = true;
    const content = model.getValue();
    if (!content) return;

    const fso = getFileByPath(model.uri.path);

    if (fso.orgContent === content) {
        modified = false;
    }

    store.dispatch(updateFileState({ ...fso, content, modified }));
    fileUpdated({ ...fso, content });
}

export function loadProject(getState: () => AppEditorState) {
    disposeAllModels();

    try {
        const fileSystemObjects = getState().app.fileSystemObjects;
        fileSystemObjects.forEach(fso => {
            if (fso.type === 'file') {
                const language: string | null = fso.path.endsWith(".tsx") ? "typescript_react" : fso.path.endsWith(".ts") ? "typescript" : null;
                const model = monaco.editor.createModel(fso.content, language, monaco.Uri.parse(fso.path));
                model.onDidChangeContent(() => {
                    onModelContentChanged(model);
                });
            }
        });
    } catch (e) {
        console.log("Error creating monaco models", e);
    }
}

export function setModelMarkers(path: string, data) {
    const model = getModel(path);
    monaco.editor.setModelMarkers(model, "planet9_typescript", data);
}

export { monaco };
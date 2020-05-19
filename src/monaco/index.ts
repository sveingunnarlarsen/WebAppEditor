//import { monaco as monacoRef } from "@monaco-editor/react";
import {default as monacoRef} from "./monaco";
import { updateFileState } from "../actions/file";
import { getFileByPath } from "../store/utils";
import store from "../store";
import { fileUpdated } from "../completer";

class MonacoManager {
    private inputTimeout: number;
    private instance: typeof monaco;
    private isReady: boolean;

    private monacoData: { model: monaco.editor.ITextModel, state: monaco.editor.ICodeEditorViewState }[];

    constructor(monacoRef) {
        this.isReady = true;
        this.instance = monacoRef;
        /*
        monacoRef.init()
            .then(monaco => {
                this.instance = monaco;
                this.isReady = true;
                console.log("Monaco is initialized");
            })
            .catch(e => {
                console.log("Error initializing monaco", e);
            })
        */
    }

    private disposeAllData(): void {
        this.instance.editor.getModels().forEach(model => {
            model.dispose();
        });
    }

    private onModelContentChagned(model: monaco.editor.ITextModel) {
        clearTimeout(this.inputTimeout);

        this.inputTimeout = setTimeout(() => {
            let modified = true;
            const content = model.getValue();
            if (!content) return;

            const fso = getFileByPath(model.uri.path);

            if (fso.orgContent === content) {
                modified = false;
            }

            store.dispatch(updateFileState({...fso, content, modified}));
            fileUpdated({...fso, content});
        }, 500);

    }

    public async getInstance(): Promise<typeof monaco> {
        return new Promise((resolve, reject) => {
            const check = () => {
                if (this.isReady) {
                    resolve(this.instance);
                } else {
                    setTimeout(check, 100);
                }
            }
            check();
        });
    }

    public getModel(path) {
        return this.instance.editor.getModel(monaco.Uri.parse(path));
    }

    public createModel(fso) {
        if (fso.type === 'file') {
            const model = this.instance.editor.createModel(fso.content, null, monaco.Uri.parse(fso.path));
            model.onDidChangeContent(() => {
                this.onModelContentChagned(model);
            });
        }
    }

    public deleteModel(path: string) {
        this.instance.editor.getModel(monaco.Uri.parse(path)).dispose();
    }

    public loadProject(getState: () => any) {
        this.disposeAllData();

        try {
            const fileSystemObjects = getState().app.fileSystemObjects;
            fileSystemObjects.forEach(fso => {
                if (fso.type === 'file') {
                    const model = this.instance.editor.createModel(fso.content, null, monaco.Uri.parse(fso.path));
                    model.onDidChangeContent(() => {
                        this.onModelContentChagned(model);
                    });
                }
            });
        } catch (e) {
            console.log("Error creating monaco models", e);
        }
    }

    public setModelMarkers(path: string, data) {
        const model = this.getModel(path);
        this.instance.editor.setModelMarkers(model, "planet9_typescript", data);
    }
}

export default new MonacoManager(monacoRef);


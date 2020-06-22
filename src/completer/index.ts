import store from "../store";
import { monaco, deleteModel, createModel } from "../monaco";
import { provideDiagnostics } from "./providers/diagnosticProvider";
import { CompletionItemProvider } from "./providers/completionItemProvider";
import { SignatureHelpProvider } from "./providers/signatureHelpProvider";
import { HoverProvider } from "./providers/hoverProvider";
import { DefinitionProvider } from "./providers/definitionProvider";
import { ReferenceProvider } from "./providers/referenceProvider";
import { DocumentFormattingEditorProvider } from "./providers/documentFormattingEditProvider";
import { LanguageClient, ClientEvent } from '../../lib/LanguageClient';

import { languageServerConnected, languageServerDisconnected } from "../actions";
import { FileSystemObject } from "../types";
import { updateModel } from "../monaco";
import { spanToRange } from "./utils";

let appId;
const client = new LanguageClient();

(async function() {
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const lsUrl = `${wsProtocol}://${window.location.hostname}:8082`;
        await client.connect(lsUrl);
        store.dispatch(languageServerConnected());
        console.log("Language client connected");

        // @ts-ignore
        client.on("disconnected", async (closeEvent) => {
            if (closeEvent.wasClean) return;      
            store.dispatch(languageServerDisconnected());      
            await new Promise(r => setTimeout(r, 1000));
            const result = await client.connect(lsUrl);
            if (result.success) {
                store.dispatch(languageServerConnected());
                if (!appId) return;
                client.initialize(appId);
                console.log('LanguageClient reconnected');
            }
        });

    } catch (e) {
        console.log("Error connecting to language server", e);
    }

    if (client.isConnected) {
        store.subscribe(handleChange);
    }

    const completionItemProvider = new CompletionItemProvider(client);
    const signatureHelpProvider = new SignatureHelpProvider(client);
    const hoverProvider = new HoverProvider(client);
    const definitionProvider = new DefinitionProvider(client);
    const referenceProvider = new ReferenceProvider(client);
    const documentFormattingEditProvider = new DocumentFormattingEditorProvider(client);

    ["typescript", "typescript_react"].forEach(languageId => {
        monaco.languages.registerCompletionItemProvider(languageId, completionItemProvider);
        monaco.languages.registerSignatureHelpProvider(languageId, signatureHelpProvider);
        monaco.languages.registerHoverProvider(languageId, hoverProvider);
        monaco.languages.registerDefinitionProvider(languageId, definitionProvider);
        monaco.languages.registerReferenceProvider(languageId, referenceProvider);
        monaco.languages.registerDocumentFormattingEditProvider(languageId, documentFormattingEditProvider);
    });

    // @ts-ignore
    client.on('publishDiagnostics', (result) => {
        provideDiagnostics(result);
    });
})();

function handleChange() {
    if (store.getState().app.id && store.getState().app.id !== appId) {
        appId = store.getState().app.id;
        client.initialize(appId);
        console.log("Language client initialized for project", appId);
    }
}

export async function formatAllFiles() {
    if (client.isReady) {

        const options: monaco.languages.FormattingOptions = {
            insertSpaces: true,
            tabSize: 4,
        }

        const models = monaco.editor.getModels();
        models.forEach(async model => {
            if (model.uri.path.includes(".ts")) {
                const request = await client.getFormattingEdits(
                    model.uri.path,
                    options.insertSpaces,
                    options.tabSize,
                );

                const response = await request.wait();

                const textEdits = response.result.map<monaco.languages.TextEdit>(e => ({
                    text: e.newText,
                    range: spanToRange(e.span, model.uri),
                }));

                // @ts-ignore
                model.applyEdits(textEdits);
                updateModel(model);
            }
        })
    }
}

export async function fileChanged(newFso: FileSystemObject, oldFso: FileSystemObject) {
    if (newFso.path !== oldFso.path) {
        console.log("Deleting and creating fso with path: ", oldFso.path, newFso.path);
        await fileDeleted(oldFso.path, oldFso.type);
        await fileCreated(newFso.path, newFso.type, newFso.content);
    }
}

export async function fileUpdated({ path, content }: { path: string, content: string }) {
    if (client.isReady) {
        try {
            if (!content) {
                console.log("textDocumentChanged with no content: ", content);
                return;
            }
            await client.textDocumentChanged(path, content);
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileDeleted(path: string, type: 'file' | 'folder') {
    if (client.isReady) {
        try {
            await client.textDocumentDeleted(path);
            console.log("File with path deleted: ", path);
        } catch (e) {
            console.log("Language client error", e);
        }
    }
    if (type === 'file') {
        await deleteModel(path);
    }
}

export async function fileCreated(path: string, type: 'file' | 'folder' = 'file', content: string = "") {
    if (client.isReady) {
        try {
            await client.textDocumentCreated(path, type, content);
            console.log("File with path created: ", path);
        } catch (e) {
            console.log("Language client error", e);
        }
    }
    if (type === 'file') {
        await createModel({ path, type, content });
    }
}

export async function fileOpened(path: string) {
    if (client.isReady) {
        try {
            await client.textDocumentOpened(path);
            console.log("File with path opened: ", path);
        } catch (e) {
            console.log("Language client error: ", e);
        }
    }
}
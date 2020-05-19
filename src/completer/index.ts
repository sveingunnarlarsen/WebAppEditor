import store from "../store";
import MonacoManager from "../monaco";
import { LanguageClient as LanguageClientType, ClientEvent } from "../types/language-client";
import { provideDiagnostics } from "./providers/diagnosticProvider";
import { CompletionItemProvider } from "./providers/completionItemProvider";
import { SignatureHelpProvider } from "./providers/signatureHelpProvider";
import { HoverProvider } from "./providers/hoverProvider";
import { DefinitionProvider } from "./providers/definitionProvider";
import { ReferenceProvider } from "./providers/referenceProvider";

let appId;
//@ts-ignore
const client: LanguageClientType = new LanguageClient();

(async function () {
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const lsUrl = `${wsProtocol}://${window.location.hostname}:8082`;
        await client.connect(lsUrl);
        console.log("Language client connected");

        // @ts-ignore
        client.on("disconnected", async (closeEvent) => {
            if (closeEvent.wasClean) return;
            await new Promise(r => setTimeout(r, 1000));
            const result = await client.connect(lsUrl);
            if (result.success) {
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

    const monacoInstance = await MonacoManager.getInstance();
    window.monaco = monacoInstance;

    /*
    monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
    });
    */
    
    monacoInstance.languages.registerCompletionItemProvider('typescript', new CompletionItemProvider(client));
    monacoInstance.languages.registerSignatureHelpProvider('typescript', new SignatureHelpProvider(client));
    monacoInstance.languages.registerHoverProvider('typescript', new HoverProvider(client));
    monacoInstance.languages.registerDefinitionProvider('typescript', new DefinitionProvider(client));
    monacoInstance.languages.registerReferenceProvider('typescript', new ReferenceProvider(client));


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

export async function fileUpdated({ path, content }: { path: string, content: string }) {
    if (client.isReady) {
        try {
            await client.textDocumentChanged(path, content);
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileDeleted(path: string) {
    if (client.isReady) {
        try {
            await client.textDocumentDeleted(path);
            MonacoManager.deleteModel(path);
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileCreated(path: string, type: 'file' | 'foler' = 'file', content: string = "") {
    if (client.isReady) {
        try {
            await client.textDocumentCreated(path, type, content);
            MonacoManager.createModel({ path, type, content });
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileOpened(path: string) {
    if (client.isReady) {
        try {
            await client.textDocumentOpened(path);
        } catch (e) {
            console.log("Language client error: ", e);
        }
    }
}
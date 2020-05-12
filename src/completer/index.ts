import store from "../store";
import {monaco} from "@monaco-editor/react";
import {LanguageClient as LanguageClientType, ClientEvent} from "../types/language-client";
import {provideDiagnostics} from "./providers/diagnosticProvider";
import {CompletionItemProvider} from "./providers/completionItemProvider";
import {SignatureHelpProvider} from "./providers/signatureHelpProvider";
import {HoverProvider} from "./providers/hoverProvider";

let appId;
const client: LanguageClientType = new LanguageClient();

(async function() {
	try {
	    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		await client.connect(`${wsProtocol}://${window.location.hostname}:8082`);
		console.log("Language client connected");
	} catch (e) {
		console.log("Error connecting to language server", e);
	}

	if (client.isConnected) {
		store.subscribe(handleChange);
	}
})();

function handleChange() {
	if (store.getState().app.id && store.getState().app.id !== appId) {
		appId = store.getState().app.id;
		client.initialize(appId);
		console.log("Language client initialized for project", appId);
	}
}

monaco.init().then(monaco => {                            
    /*
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        noLib: true,
    });
    */    

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,        
    });
    
    window.monaco = monaco;
    monaco.languages.registerCompletionItemProvider('typescript', new CompletionItemProvider(client));
    monaco.languages.registerSignatureHelpProvider('typescript', new SignatureHelpProvider(client));
    monaco.languages.registerHoverProvider('typescript', new HoverProvider(client));

	client.on('publishDiagnostics', (result) => {
        console.log("Markers: ", result);
		provideDiagnostics(result, monaco);
	});
});

export async function fileDeleted(path: string) {
    if (client.isReady) {
        try {
            await client.textDocumentDeleted(path);   
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileCreated(path: string, type: 'file' | 'foler' = 'file', content: string = "") {
    if (client.isReady) {
        try {
            await client.textDocumentCreated(path, type, content);   
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileOpened(path: string) {
    if (client.isReady) {
        try {            
			client.textDocumentOpened(path);
        } catch (e) {
            console.log("Language client error: ", e);
        }
    }
}
import store from "../store";
import {monaco} from "@monaco-editor/react";
import {LanguageClient as LanguageClientType} from "../types/language-client.d.ts";
import {CompletionItemProvider} from "./providers/completionItemProvider";

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
    monaco.languages.registerCompletionItemProvider('typescript', new CompletionItemProvider(client));
});

export function fileDeleted() {

}

export function fileCreated() {
    
}



/*
import store from "../store";
import {openDialog} from "../actions";
import {DialogType} from "../types/dialog";
import {showSignatureHelp, closeSignatureHelp} from "../actions/editor";

const tool = ace.require("ace/ext/language_tools");

const client = new LanguageClient();
let activeEditor = null;

client.on("publishDiagnostics", result => {
	if (activeEditor) {
		activeEditor.getSession().setAnnotations([]);
		const annotations = [];
		if (result.diagnostics.length > 0) {
			for (let i = 0; i < result.diagnostics.length; i++) {
				const annotation = result.diagnostics[i];
				annotations.push({
				    row: annotation.range.start.line,
				    column: annotation.range.start.character,
				    text: annotation.message,
				    type: "error",
				});
			}
			activeEditor.getSession().setAnnotations(annotations);
		}
	}
});

const aceCompleter = {
	getCompletions: async function(editor, session, pos, prefix, cb) {
		if (await isConnected()) {
            console.log("getCompletions called");
			activeEditor = editor;
			const {row, column} = pos;
			const file = editor.file;

			client.textDocumentChanged(file.path, editor.getValue());
			const response = await client.getCompletions(file.path, row, column, editor.getValue());

			if (response.result && response.result.length > 0) {
				const list = response.result.map(entry => {
					return {
						captation: entry.kind,
						value: entry.name,
						meta: entry.kindModifiers,
						score: parseInt(entry.sortText)
					};
				});
				return cb(null, list);
			}
		}
		// TODO: Error dispatch. Could not connected.
		cb(null, []);
	}
};

(async function() {
	try {
	    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		await client.connect(`${wsProtocol}://${window.location.hostname}:8082`);
		tool.setCompleters([aceCompleter]);
		console.log("Language client connected");
	} catch (e) {
		console.log("Error connecting to language server", e);
	}

	if (client.isConnected) {
		store.subscribe(handleChange);
	}
})();

let appId;
function handleChange() {
	if (store.getState().app.id && store.getState().app.id !== appId) {
		appId = store.getState().app.id;
		client.initialize(appId);
		console.log("Language client initialized for project", appId);
	}
}

async function isConnected() {
	let connected = client.isConnected;
	if (!connected) {
		connected = await client.reconnect();
		client.initialize(appId);
	}
	return connected;
}

export async function fileDeleted(path: string) {
    if (await isConnected()) {
        try {
            await client.textDocumentDeleted(path);   
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function fileCreated(path: string, type: 'file' | 'foler' = 'file', content: string = "") {
    if (await isConnected()) {
        try {
            await client.textDocumentCreated(path, type, content);   
        } catch (e) {
            console.log("Language client error", e);
        }
    }
}

export async function findReferences(editor) {
	if (await isConnected()) {
		const file = editor.file;
		const {row, column} = editor.getCursorPosition();
		client.textDocumentChanged(file.path, editor.getValue());
		const response = await client.findReferences(file.path, row, column, editor.getValue());
		store.dispatch(openDialog(DialogType.SHOW_REFERENCES, response.result));
	}
}

export async function signatureHelp(editor) {
	if (await isConnected()) {
		const cursorSelector = `#${editor.container.id} div.ace_cursor`;
		const cursorDom = document.querySelector(cursorSelector);
		const rect = cursorDom.getBoundingClientRect();

		const file = editor.file;
		const {row, column} = editor.getCursorPosition();
		client.textDocumentChanged(file.path, editor.getValue());
		const response = await client.getSignatureHelp(file.path, row, column);
		if (response.result) {
			store.dispatch(showSignatureHelp({result: response.result, rect}));
		} else {
			store.dispatch(closeSignatureHelp());
		}
	}
}

window.languageClient = client;
*/
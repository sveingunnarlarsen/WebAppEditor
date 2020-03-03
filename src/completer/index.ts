import store from "../store";
import {openDialog} from "../actions";
import {DialogType} from "../types/dialog";
import {showSignatureHelp, closeSignatureHelp} from "../actions/editor";
import "ace-builds/src-noconflict/ext-language_tools";
const tool = ace.require("ace/ext/language_tools");

const client = new LanguageClient();
let activeEditor = null;

client.on("publishDiagnostics", result => {
	if (activeEditor) {
	    /*
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
		*/
	}
});

const aceCompleter = {
	getCompletions: async function(editor, session, pos, prefix, cb) {
		if (await isConnected()) {
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
		await client.connect(`wss://${window.location.hostname}:8082`);
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

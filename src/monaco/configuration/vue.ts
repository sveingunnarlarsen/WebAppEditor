import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export var conf: monaco.languages.LanguageConfiguration = {
	comments: {
		// symbol used for single line comment. Remove this entry if your language does not support line comments
		"lineComment": "//",
		// symbols used for start and end a block comment. Remove this entry if your language does not support block comments
		"blockComment": [ "/*", "*/" ]
	},
	// symbols used as brackets
	brackets: [
		["{", "}"],
		["[", "]"],
		["(", ")"]
	]
}
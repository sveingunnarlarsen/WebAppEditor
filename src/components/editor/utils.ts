import * as imageType from "image-type";
import store from "../../store";
import {openDialog} from "../../actions";
import {DialogType} from "../../types/dialog";
import {getPrettierConfig} from "../../store/utils";

const prettyDefaults = {
	printWidth: 230,
	bracketSpacing: true,
	jsxBracketSameLine: false,
	proseWrap: "never"
};

function getParser(parser) {
	switch (parser) {
		case "tsx":
		case "jsx":
		case "typescript":
		case "javascript":
			return "typescript";
		default:
			return parser;
	}
}

export function prettyPrint(editor) {
	const mode = editor.getOptions().mode;
	const pieces = mode.split("/");
	const parser = pieces[pieces.length - 1];

	const config = getPrettierConfig() || prettyDefaults;
	config.plugins = prettierPlugins;
	config.parser = getParser(parser);

	const cursorPos = editor.selection.getCursor();

	try {
		const formatted = prettier.format(editor.getValue(), config);
		editor.setValue(formatted);
	} catch (e) {
		store.dispatch(openDialog(DialogType.SYNTAX_ERROR, e.message));
		return;
	}

	setTimeout(() => {
		editor.selection.moveToPosition(cursorPos);
		editor.focus();
	});
}

export function someMethod(one: string, two: boolean, three: any) {
    return null;
}

export function calculatePos({x, y}, root) {
	const screenW = window.innerWidth;
	const screenH = window.innerHeight;
	const rootW = root.offsetWidth;
	const rootH = root.offsetHeight;

	const right = screenW - x > rootW;
	const left = !right;
	const top = screenH - y > rootH;
	const bottom = !top;

	if (right) {
		root.style.left = `${x + 5}px`;
	}

	if (left) {
		root.style.left = `${x - rootW - 5}px`;
	}

	if (top) {
		root.style.top = `${y + 5}px`;
	}

	if (bottom) {
		root.style.top = `${y - rootH - 5}px`;
	}
}

export async function checkIfImage(base64) {
    
}
/*

import * as imageType from "image-type";

const decoder = new TextDecoder('utf8');

export async function getFileContent(pfs, filePath: string) {
    const buffer = await pfs.readFile(filePath);
    const imageMeta = imageType(buffer);
    if (imageMeta) {
        return btoa(String.fromCharCode.apply(null, buffer));
    } else {
        return decoder.decode(buffer);
    }
}
*/
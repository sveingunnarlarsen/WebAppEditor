import produce from "immer";
import uuid from "uuid/v4";
import {Actions} from "../types"
import {EditorActions, EditorState, Editor, SplitDirection} from "../types/editor";

export const initState: EditorState = {
	activeEditor: "",
	activeContainer: "",
	editors: [],
	containers: [],
	openFileAt: null,
};

function initEditor(draft, fileId) {
	const editorId = uuid(); //draft.editors.length + 1;
	const containerId = uuid(); //draft.containers.length + 1;

	draft.activeEditor = editorId;
	draft.activeContainer = containerId;

	draft.editors.push({
		id: editorId,
		activeTab: fileId,
		tabs: [fileId],
		containerId
	});

	draft.containers.push({
		id: containerId,
		split: SplitDirection.VERTICAL,
		isTop: true,
		editor1: {
			isContainer: false,
			id: editorId
		}
	});
}

const reset = produce((draft) => {
    return {...initState};
});

const resetOpenAt = produce((draft) => {
    draft.openFileAt = null;
});

const showFile = produce((draft, fileId, editorId, openFileAt?) => {
	if (openFileAt) {
		draft.openFileAt = openFileAt;
	}

	if (!draft.activeEditor) {
		initEditor(draft, fileId);
	} else {
		const editor = editorId ? draft.editors.find(e => e.id === editorId) : draft.editors.find(e => !!e.tabs.find(t => t === fileId));
		if (editor) {
			draft.activeEditor = editor.id;
			draft.activeContainer = editor.containerId;
			editor.activeTab = fileId;
		} else {
			const activeEditor = draft.editors.find(e => e.id === draft.activeEditor) || draft.editors[0];
			activeEditor.activeTab = fileId;
			activeEditor.tabs.push(fileId);
		}
	}
});

const closeTab = produce((draft, fileId, editorId) => {
	const editor = draft.editors.find(e => e.id === editorId);
	const index = editor.tabs.findIndex(t => t === fileId);
	editor.tabs.splice(index, 1);
	if (editor.activeTab === fileId) {
		if (index >= editor.tabs.length) {
			editor.activeTab = editor.tabs[index - 1];
		} else {
			editor.activeTab = editor.tabs[index];
		}
	}
	// If there is no active tab there are no files in the editor. Destroy container
	if (!editor.activeTab) {
		const editorIndex = draft.editors.findIndex(e => e.id === editor.id);
		draft.editors.splice(editorIndex, 1);

		const container = draft.containers.find(c => c.id === editor.containerId);
		if (container.editor1 && container.editor2) {
			if (container.isTop) {
				if (container.editor1.id === editor.id) {
					container.editor1 = container.editor2;
					container.editor2 = null;
				} else {
					container.editor2 = null;
				}
			} else {
				console.log("Should pop editor container to parent");
			}
		} else {
			if (container.isTop) {
				draft.activeEditor = "";
				draft.activeContainer = "";
				draft.containers = [];
			}
		}
	}
	// TODO: Remove editor and container if needed.
});

// TODO: Should close all references of file in open editors
const closeFile = produce((draft, fileId) => {
	if (!draft.editors) return;
	const editors = draft.editors.filter(e => !!e.tabs.find(t => t === fileId));

	for (let i = 0; i < editors.length; i++) {
		const editor = editors[i];
		const index = editor.tabs.findIndex(t => t === fileId);
		editor.tabs.splice(index, 1);

		if (editor.activeTab === fileId) {
			if (index >= editor.tabs.length) {
				editor.activeTab = editor.tabs[index - 1];
			} else {
				editor.activeTab = editor.tabs[index];
			}
		}

		if (!editor.activeTab) {
			const editorIndex = draft.editors.findIndex(c => c.id === editor.id);
			draft.editors.splice(editorIndex, 1);

			const container = draft.containers.find(c => c.id === editor.containerId);
			if (container.editor1 && container.editor2) {
				if (container.isTop) {
					if (container.editor1.id === editor.id) {
						container.editor1 = container.editor2;
						container.editor2 = null;
					} else {
						container.editor2 = null;
					}
				} else {
					console.log("Should pop editor container to parent");
				}
			} else {
				if (container.isTop) {
					draft.activeEditor = "";
					draft.activeContainer = "";
					draft.containers = [];
				}
			}
		}
	}
});

const closeAllTabs = produce((draft, fileId) => {
	return initState;
});

const closeContainer = produce((draft, containerId) => {});

const splitEditor = produce((draft, direction, editorId, fileId) => {
	const editor = draft.editors.find(e => e.id === editorId);
	const containerId = editor.containerId;
	const container = draft.containers.find(c => c.id === containerId);

	const newEditorId = uuid(); //draft.editors.length + 1;

	if (container.editor1 && container.editor2) {
		console.log("Should create a new container");
	} else {
		draft.editors.push({
			id: newEditorId,
			activeTab: fileId,
			tabs: [fileId],
			containerId: container.id
		});
		container.editor2 = {
			isContainer: false,
			id: newEditorId
		};
	}
});

const setActiveEditor = produce((draft, id) => {
	draft.activeEditor = id;
});

export function editor(state = initState, action) {
	switch (action.type) {
	    case Actions.RESET:
	        return reset(state);
		case EditorActions.RESET_OPEN_AT:
			return resetOpenAt(state);
		case EditorActions.SHOW_FILE:
			return showFile(state, action.fileId, action.editorId, action.openFileAt);
		case EditorActions.CLOSE_TAB:
			return closeTab(state, action.fileId, action.editorId);
		case EditorActions.CLOSE_FILE:
			return closeFile(state, action.fileId);
		case EditorActions.CLOSE_ALL_TABS:
			return closeAllTabs(state);
		case EditorActions.SPLIT_EDITOR:
			return splitEditor(state, action.direction, action.editorId, action.fileId);
		case EditorActions.SET_ACTIVE_EDITOR:
			return setActiveEditor(state, action.id);
		case EditorActions.CLOSE_SIGNATURE_HELP:
			return closeSignatureHelp(state);
		default:
			return state;
	}
}

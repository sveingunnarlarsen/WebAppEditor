import React from "react";
import {RefObject} from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {FileSystemObject} from "../../types";
import {Editor} from "../../types/editor";
import MonacoEditor from "./monaco/MonacoEditor";
import EditorContextMenu from "./EditorContextMenu";
import {updateFileState, save} from "../../actions/file";
import {openDialog} from "../../actions";
import {setActiveEditor, splitEditor} from "../../actions/editor";
import {DialogType} from "../../types/dialog";
import {SplitDirection} from "../../types/editor";
import {prettyPrint} from "./utils";
import {getFileLanguage} from '../../helpers/utils';
import {fileOpened, fileUpdated} from "../../completer/index";
import MonacoManager from "../../monaco";

const mapState = (state, ownProps) => {
	let fso = state.app.fileSystemObjects.find(f => f.id === ownProps.fileId);
	return {
		fso,
		editorResized: state.editorResized,
		updateEditors: state.updateEditors,
	}
};

function mapDispatch(dispatch) {
	return {
		updateFileState: file => dispatch(updateFileState(file)),
		save: () => dispatch(save()),
		setActiveEditor: id => dispatch(setActiveEditor(id)),
		openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP)),
		splitEditor: (direction, editorId, fileId) => dispatch(splitEditor(direction, editorId, fileId))
	};
}

interface EditorProps {
	fso: FileSystemObject;
	viewState: monaco.editor.ICodeEditorViewState | null;
	editorId: string | null;
	
	editorResized: number;
	updateEditors: number;

	save: () => void;
	updateFileState: (fso: FileSystemObject) => void;	
	splitEditor: (direction: SplitDirection, editorId: string, fileId: string) => void;
	keepEditorState: (editor: monaco.editor.ICodeEditor) => void | null;
}

class AceEditorContainer extends React.Component<EditorProps> {
		
	inputTimeout: number;
	editor: monaco.editor.IStandaloneCodeEditor;
	
	constructor(props) {
		super(props);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.fso.id !== nextProps.fso.id) {
			if (this.props.keepEditorState) {
				this.props.keepEditorState(this.editor);
			}
			return true;
		}
		if (this.props.editorResized != nextProps.editorResized) {
			return true;
		}
		if (this.props.updateEditors != nextProps.updateEditors) {
			return true;
		}
		return false;
	}

	componentDidUpdate() {
		if (this.editor) {
			this.editor.layout();			
			fileOpened(this.props.fso.path);
			if (this.props.viewState) {
				setTimeout(() => {
					this.editor.focus();
				}, 100);
			}
		}
	}	

    onChange = (editor) => {
        this.inputTimeout = null;
		editor.onDidChangeModelContent(ev => {						
			clearTimeout(this.inputTimeout);

			this.inputTimeout = setTimeout(() => {
				let modified = true;

				const content = this.editor.getValue(); 
				if (!content) return;

				if (this.props.fso.orgContent === content) {
					modified = false;
				}
				this.props.updateFileState({...this.props.fso, content, modified});
				fileUpdated(this.props.fso);
			}, 500);
		});
    }
	
	addActionsAndCommands = (editor: monaco.editor.IStandaloneCodeEditor) => {

	    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
			clearTimeout(this.inputTimeout);
			this.props.updateFileState({...this.props.fso, content: this.editor.getValue(), modified: true});
			this.props.save();
		});

		if (this.props.editorId) {
			editor.addAction({
				id: "split_vertically",
				label: "Split Vertically",
				precondition: null,
				keybindingContext: null,
				contextMenuGroupId: '2_splitting',
				run: (editor) => {
					this.props.splitEditor(SplitDirection.HORIZONTAL, this.props.editorId, this.props.fso.id)
				}
			});
		}			
	}

	handleEditorDidMount = (_, editor) => {     
		this.editor = editor;
		this.addActionsAndCommands(this.editor);
        this.onChange(this.editor);      
	};

	render() {
		const {fso, viewState} = this.props;
				
		const model = MonacoManager.getModel(this.props.fso.path);		
		if (fso.content) {
			model.setValue(fso.content);
		}
		
		return (
			<React.Fragment>
				<MonacoEditor height="100%" model={model} viewState={viewState} theme="dark" editorDidMount={this.handleEditorDidMount} />
			</React.Fragment>
		);
	}
}

export default connect(
	mapState,
	mapDispatch
)(AceEditorContainer);

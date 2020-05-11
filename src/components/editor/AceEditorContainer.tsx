import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import "../../types/monaco";
import Editor from "@monaco-editor/react";

import EditorContextMenu from "./EditorContextMenu";
import {updateFileState, save} from "../../actions/file";
import {openDialog} from "../../actions";
import {setActiveEditor, splitEditor} from "../../actions/editor";
import {DialogType} from "../../types/dialog";
import {SplitDirection} from "../../types/editor";
import {prettyPrint} from "./utils";
import {getFileLanguage} from '../../helpers/utils';
import {fileOpened} from "../../completer/index";

const mapState = (state, ownProps) => {
	let fso = state.app.fileSystemObjects.find(f => f.id === ownProps.fileId);
	if (ownProps.container) {
		return {
			fso,
			editor: ownProps.container.props.editor,
			editorResized: state.editorResized
		};
	} else {
		return {
			fso,
			editor: {id: "in_dialog"},
			editorResized: state.editorResized
		};
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
	fso: any;
}

class AceEditorContainer extends React.Component<EditorProps> {
	constructor(props) {
		super(props);
		this.editor = React.createRef();
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log("Should component update");
		if (this.props.fso.id !== nextProps.fso.id || this.props.editorResized !== nextProps.editorResized) {
			return true;
		} else {
			return false;
		}
	}

	componentDidUpdate() {
		if (this.editor.current) {
			this.editor.current.layout();
            const model = this.editor.current.getModel();
		    model.uri.path = this.props.fso.path;
			fileOpened(model.uri.path);
		}
	}

	componentWillUnmount() {
		this.props.keepEditorState(this.editor.current);
	}

	componentDidMount() {
		console.log("Editor did mount");
	}

    onChange = (editor) => {
        let inputTimeout = null;
		editor.onDidChangeModelContent(ev => {
			
			console.log(ev);
			
			clearTimeout(inputTimeout);

			inputTimeout = setTimeout(() => {
				let modified = true;

				const content = this.editor.current.getValue(); 

				if (this.props.fso.orgContent === content) {
					modified = false;
				}

				this.props.updateFileState({...this.props.fso, content, modified});
			}, 500);
		});
    }
	
	addActionsAndCommands = (editor) => {
	    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, this.props.save);
	    
	    editor.addAction({
	        id: "split_vertically",
	        label: "Split Vertically",
	        precondition: null,
	        keybindingContext: null,
	        contextMenuGroupId: '2_splitting',
	        run: (editor) => {
	            this.props.splitEditor(SplitDirection.HORIZONTAL, this.props.editor.id, this.props.fso.id)
	        }
	    })
	}

	handleEditorDidMount = (_, editor) => {      		                          
		this.editor.current = editor;
		window.currentEditor = editor;
		const model = this.editor.current.getModel();
		model.uri.path = this.props.fso.path;

		this.addActionsAndCommands(this.editor.current);
        this.onChange(this.editor.current);      

		if (this.props.editorState) {
			if (this.props.editorState.viewState) {
				this.editor.current.restoreViewState(this.props.editorState.viewState);
			}
			setTimeout(() => {
				this.editor.current.focus();
			}, 100);			
		}		
	};

	render() {
		const {classes, fso, editor} = this.props;
        console.log(getFileLanguage(fso.path));
		fileOpened(fso.path); 
		console.log("Rendering editor");

		return (
			<React.Fragment>
				<Editor height="100%" language={getFileLanguage(fso.path)} theme="dark" value={fso.content} editorDidMount={this.handleEditorDidMount} options={{renderValidationDecorations: "editable"}} />
			</React.Fragment>
		);
	}
}

AceEditorContainer.propTypes = {
	fso: PropTypes.object.isRequired
};

export default connect(
	mapState,
	mapDispatch
)(AceEditorContainer);

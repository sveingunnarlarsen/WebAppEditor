import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Editor from "./monaco/MonacoEditor";
import EditorContextMenu from "./EditorContextMenu";
import {updateFileState, save} from "../../actions/file";
import {openDialog} from "../../actions";
import {setActiveEditor, splitEditor} from "../../actions/editor";
import {DialogType} from "../../types/dialog";
import {SplitDirection} from "../../types/editor";
import {prettyPrint} from "./utils";
import {getFileLanguage} from '../../helpers/utils';
import {fileOpened} from "../../completer/index";
import MonacoManager from "../../monaco";

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
	inputTimeout: any;
	constructor(props) {
		super(props);
		this.editor = React.createRef();
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.fso.id !== nextProps.fso.id || this.props.editorResized !== nextProps.editorResized) {
			if (this.props.keepEditorState) {
				this.props.keepEditorState(this.editor.current);
			}			
			return true;
		} else {
			return false;
		}
	}

	componentDidUpdate() {
		if (this.editor.current) {
			this.editor.current.layout();			
			fileOpened(this.props.fso.path);
			if (this.props.editorState) {
				setTimeout(() => {
					this.editor.current.focus();
				}, 100);
			}
		}
	}

	componentWillUnmount() {
		console.log("Component unmnounting");
		//this.props.keepEditorState(this.editor.current);
	}

	componentDidMount() {
		console.log("Editor did mount");		
	}

    onChange = (editor) => {
        this.inputTimeout = null;
		editor.onDidChangeModelContent(ev => {						
			clearTimeout(this.inputTimeout);

			this.inputTimeout = setTimeout(() => {
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
		console.log("We are here");
	    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
			clearTimeout(this.inputTimeout);
			this.props.updateFileState({...this.props.fso, content: this.editor.current.getValue(), modified: true});
			this.props.save();
		});
	    
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

	restoreEditorState = () => {
		if (this.props.editorState) {
			if (this.props.editorState.viewState) {
				this.editor.current.restoreViewState(this.props.editorState.viewState);
			}
			setTimeout(() => {
				this.editor.current.focus();
			}, 100);			
		}		
	}

	handleEditorDidMount = (_, editor) => {     
		this.editor.current = editor;
		this.addActionsAndCommands(this.editor.current);
        this.onChange(this.editor.current);      
	};

	render() {
		const {classes, fso, editor} = this.props;		
		fileOpened(fso.path); 

		console.log("Rendering editor");

		const model = MonacoManager.getModel(this.props.fso.path);
		console.log("Before");
		const viewState = this.props.editorState?.viewState;
		console.log("View state: ", viewState);

		return (
			<React.Fragment>
				<Editor height="100%" model={model} viewState={viewState} theme="dark" editorDidMount={this.handleEditorDidMount} />
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

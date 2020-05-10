import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Editor from "@monaco-editor/react";
import {monaco}from "@monaco-editor/react";

import EditorContextMenu from "./EditorContextMenu";
import SignatureHelp from "./SignatureHelp";
import {updateFileState, save} from "../../actions/file";
import {openDialog} from "../../actions";
import {setActiveEditor, splitEditor} from "../../actions/editor";
import {DialogType} from "../../types/dialog";
import {SplitDirection} from "../../types/editor";
import {prettyPrint} from "./utils";
import {getFileLanguage} from '../../helpers/utils';


let monacoInstance;
monaco.init().then(monaco => {
    monacoInstance = monaco;
});

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

class AceEditorContainer extends React.Component {
	constructor(props) {
		super(props);
		this.editor = React.createRef();
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log("Should component update");
		if (this.props.fso.id !== nextProps.fso.id || this.props.editorResized !== nextProps.editorResized /* || this.ace.current.editor.getValue() !== this.props.fso.content*/) {
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
		}
	}

	componentWillUnmount() {
	    
	}

	componentDidMount() {
	    
	}

	onBlur = event => {
		console.log("Editor blur event fired");
	};

	onFocus = () => {
		if (this.props.editor) {
			this.props.setActiveEditor(this.props.editor.id);
		}
	};
	
	addActionsAndCommands = (editor) => {
	    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KEY_S, () => {
	        this.props.save();
	    })
	    
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
	    window.monacoEditor = editor;
		this.editor.current = editor;
		const model = this.editor.current.getModel();
		model.uri.path = this.props.fso.path;
		
		this.addActionsAndCommands(this.editor.current);
		
		let inputTimeout = null;
		this.editor.current.onDidChangeModelContent(ev => {
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
	};

	render() {
		const {classes, fso, editor} = this.props;
		console.log("Rendering editor: ", fso, editor, monaco);

        console.log(getFileLanguage(fso.path));

		return (
			<React.Fragment>
				<Editor height="100%" language={getFileLanguage(fso.path)} theme="dark" value={fso.content} editorDidMount={this.handleEditorDidMount} />
				<SignatureHelp />
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

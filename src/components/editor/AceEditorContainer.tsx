import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Editor from "@monaco-editor/react";

import EditorContextMenu from "./EditorContextMenu";
import SignatureHelp from "./SignatureHelp";
import {updateFileState, save} from "../../actions/file"
import {openDialog} from "../../actions";
import {DialogType} from "../../types/dialog";
import {setActiveEditor} from "../../actions/editor";
import {prettyPrint} from "./utils";
import {signatureHelp} from "../../completer";


const mapState = (state, ownProps) => {
	let fso = state.app.fileSystemObjects.find(f => f.id === ownProps.fileId);
	if (ownProps.container) {
		return {
			fso,
			editor: ownProps.container.props.editor,
			editorResized: state.editorResized,
			showSignatureHelp: state.editor.showSignatureHelp
		};
	} else {
		return {
			fso,
			editor: {id: "in_dialog"},
			editorResized: state.editorResized,
			showSignatureHelp: state.editor.showSignatureHelp
		};
	}
};

function mapDispatch(dispatch) {
	return {
		updateFileState: file => dispatch(updateFileState(file)),
		save: () => dispatch(save()),
		setActiveEditor: id => dispatch(setActiveEditor(id)),
		openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP))
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

	handleEditorDidMount = (_, editor) => {
        this.editor.current = editor;
        
        debugger;
        
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
            }, 1000);
        });
	}

	render() {
		const {classes, fso, editor} = this.props;
		console.log("Rendering editor: ", fso, editor);
		
		return (
			<React.Fragment>
                <Editor 
                    height="100%" 
                    language="javascript" 
                    theme="dark"
                    value={fso.content}
                    editorDidMount={this.handleEditorDidMount}
                />
				<EditorContextMenu container={this} />
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

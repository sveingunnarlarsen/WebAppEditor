import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import AceEditor from "react-ace-builds";
import "ace-builds/src-noconflict/ext-modelist";
import "ace-builds/src-noconflict/ext-searchbox";
import "./aceModes";
import "./aceThemes";

ace.config.set("basePath", "/public/ace");

import EditorContextMenu from "./EditorContextMenu";
import SignatureHelp from "./SignatureHelp";
import {updateFileState, save} from "../../actions/app";
import {openDialog} from "../../actions";
import {DialogType} from "../../types/dialog";
import {setActiveEditor} from "../../actions/editor";
import {prettyPrint} from "./utils";
import {signatureHelp} from "../../completer";

const modelist = ace.require("ace/ext/modelist");
const searchbox = ace.require("ace/ext/searchbox");

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
		this.ace = React.createRef();
		this.sessions = [];
		if (props.container) {
			//Map destroy ace session to parent. So it can be called from EditorTabs.
			props.container.destroyAceSession = this.destroyAceSession.bind(this);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
	    console.log("Checking if component should update");
		if (this.props.fso.id !== nextProps.fso.id || this.props.editorResized !== nextProps.editorResized/* || this.ace.current.editor.getValue() !== this.props.fso.content*/) {
			this.updateAceSessions(nextProps.fso);
			console.log("component updating");
			return true;
		} else {
		    console.log("component not updating");
			return false;
		}
	}

	componentWillUnmount() {
		for (let i = 0; i < this.sessions.length; i++) {
			this.sessions[i].session.destroy();
		}
		this.ace.current.editor.session.destroy();
		this.ace.current.editor.destroy();
	}

	componentDidMount() {
		this.updateAceSessions(this.props.fso);
		if (this.props.handle) {
		    this.props.handle(this.ace);
		}
	}

	destroyAceSession(id) {
		const index = this.sessions.findIndex(s => s.id === id);
		if (index > 0) {
			this.sessions[index].session.destroy();
			this.sessions.splice(index, 1);
		}
	}

	updateAceSessions(fso) {
		window.aceEditor = this.ace;
		// Attach ref to file to ace editor. Used with completer.
		this.ace.current.editor.file = fso;
		if (this.sessions.length < 1) {
			const session = ace.createEditSession(fso.content, fso.path ? modelist.getModeForPath(fso.path).mode : "ace/mode/text");
			session.selection.on("changeCursor", this.onCursorChange);
			this.ace.current.editor.setSession(session);
			this.sessions.push({
				id: fso.id,
				session
			});
		} else {
			let session = this.sessions.find(s => s.id === fso.id);
			if (!session) {
				const mode = modelist.getModeForPath(fso.path);
				session = ace.createEditSession(fso.content, fso.path ? modelist.getModeForPath(fso.path).mode : "ace/mode/text");
				session.selection.on("changeCursor", this.onCursorChange);
				this.sessions.push({
					id: fso.id,
					session
				});
			} else {
				session = session.session;
			}
			this.ace.current.editor.setSession(session);
		}
		this.ace.current.editor.resize();
	}

	waitForMoreChanges(content) {
		setTimeout(() => {
			const plussOneSecond = new Date().getTime();
			const diff = plussOneSecond - (this.lastUpdate + 200);
			if (diff >= 0) {
				let modified = true;
				if (this.props.fso.orgContent === content) {
					modified = false;
				}
				this.props.updateFileState({id: this.props.fso.id, path: this.props.fso.path, content, modified});
			}
		}, 200);
	}

	onChange = content => {
		this.lastUpdate = new Date().getTime();
		this.waitForMoreChanges(content);
	};

	onBlur = event => {
		console.log("Editor blur", "not implemented");
	};

	onFocus = () => {
	    if (this.props.editor) {
            this.props.setActiveEditor(this.props.editor.id);   
	    }
	};

	onCursorChange = () => {
		if (this.props.showSignatureHelp) {
			signatureHelp(this.ace.current.editor);
		}
	};

	setKeyBindings() {
		return [
			{
				name: "save",
				bindKey: {
					win: "Ctrl-s",
					mac: "Command-s"
				},
				exec: e => this.props.save()
			},
			{
				name: "signatureHelp",
				bindKey: {
					win: "Ctrl-Shift-Space"
				},
				exec: e => signatureHelp(this.ace.current.editor)
			},
			{
				name: "prettyPrint",
				bindKey: {
					win: "Ctrl-Alt-l"
				},
				exec: e => prettyPrint(this.ace.current.editor)
			},
			{
				name: "searchApp",
				bindKey: {
					win: "Ctrl-Shift-f"
				},
				exec: e => this.props.openSearch()
			}
		];
	}

	render() {
		const {classes, fso, editor} = this.props;

		return (
			<React.Fragment>
				<AceEditor
					ref={this.ace}
					name={`ace_editor_id_${editor.id}`}
					width="100%"
                    height="calc(100% - 32px)"
					theme="tomorrow_night"
					onChange={this.onChange}
					onBlur={this.onBlur}
					onFocus={this.onFocus}
					value={fso.content}
					mode="text" // Mode is set in updateAceSession
					commands={this.setKeyBindings()}
					editorProps={{$blockScrolling: Infinity}}
					setOptions={{
						enableBasicAutocompletion: true,
						enableLiveAutocompletion: true,
						showLineNumbers: true
					}}
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

import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withStyles, styled, Styles} from "@material-ui/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ClearIcon from "@material-ui/icons/Clear";

import {FileSystemObject} from "../../types";
import {Editor} from "../../types/editor";
import AceEditorContainer from "./AceEditorContainer";
import {showFile, closeTab} from "../../actions/editor";
import {getFileById} from "../../store/utils";
import {base64ToArrayBuffer, isImage, getMimeType} from "../../helpers/utils";

const styles : Styles<any, any> = {
	tabs: {
		background: "#252526",
		minHeight: "auto",
		color: "white"
	},
	indicator: {
		background: "#1B4870"
	},
	tab: {
		minHeight: "auto",
		maxWidth: "100%",
		padding: 5,
		textTransform: "none",		
	},
	tabSelected: {
		background: "#333333"
	},
	tabWrap: {
		flexDirection: "row"
	}
};

const mapState = (state, ownProps) => {
	const editor = state.editor.editors.find(e => e.id === ownProps.editorId);
	const files = state.app.fileSystemObjects.filter(f => editor.tabs.indexOf(f.id) > -1);
	return {editor, files};
};

function mapDispatch(dispatch) {
	return {
		showFile: (id, editorId) => dispatch(showFile(id, editorId)),
		closeTab: (fileId, editorId) => dispatch(closeTab(fileId, editorId))
	};
}

interface EditorTabsProps {
	classes: any;
	editor: Editor;
	files: FileSystemObject[]

	showFile: (id: string, editorId: string) => void;
	closeTab: (fileId: string, editorId: string) => void;
}

class EditorTabs extends React.Component<EditorTabsProps> {
	openFsos: {path: string, viewState: monaco.editor.ICodeEditorViewState}[];
	constructor(props) {
		super(props);
		this.openFsos = [];
	}

	keepEditorState = (editor: monaco.editor.IStandaloneCodeEditor) => {
		const path = editor.getModel().uri.path;
		const openFso = this.openFsos.find(e => e.path === path);
		if (openFso) {
			openFso.viewState = editor.saveViewState();
		} else {
			this.openFsos.push({path, viewState: editor.saveViewState()});
		}
	}

	handleChange(event, value) {
		this.props.showFile(value, this.props.editor.id);
	}

	handleClose(e, id) {
		e.stopPropagation();		
		this.props.closeTab(id, this.props.editor.id);
	}

	getTabLabel(file) {
		return (
			<React.Fragment>
				{file.path
					.split("/")
					.splice(-2)
					.join("/")}
				<ClearIcon onClick={e => this.handleClose(e, file.id)} fontSize="small" />
			</React.Fragment>
		);
	}

	createTabs(tabs) {
		const {classes, files} = this.props;
		return tabs.map(id => {
			const file = files.find(f => f.id === id);
			const style = file.modified ? {color: "wheat"} : null;
			return <Tab classes={{root: classes.tab, wrapper: classes.tabWrap, selected: classes.tabSelected}} label={this.getTabLabel(file)} key={id} value={id} style={style} />;
		});
	}

	render() {
		const {classes, editor, files} = this.props;
		const {activeTab, tabs} = editor;

		const file = getFileById(activeTab);
		let content;
		if (isImage(file.path)) {
		    const link = `data:${getMimeType(file.path)};base64,${file.content}`
			content = <img src={link} />;
		} else {
			const state = this.openFsos.find(editor => editor.path === file.path);
			content = <AceEditorContainer viewState={state?.viewState} keepEditorState={this.keepEditorState} fileId={activeTab} editorId={editor.id}/>;
		}

		return (
			<React.Fragment>
				<Tabs variant="scrollable" scrollButtons="auto" classes={{indicator: classes.indicator}} className={classes.tabs} value={activeTab} onChange={this.handleChange.bind(this)}>
					{this.createTabs(tabs)}
				</Tabs>
				{content}
			</React.Fragment>
		);
	}
}

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(EditorTabs));

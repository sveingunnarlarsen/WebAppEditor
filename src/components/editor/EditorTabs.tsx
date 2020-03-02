import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withStyles, styled} from "@material-ui/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ClearIcon from "@material-ui/icons/Clear";
import AceEditorContainer from "./AceEditorContainer";
import {showFile, closeTab} from "../../actions/editor";
import {getFileById} from "../../store/utils";
import {base64ToArrayBuffer, isImage, getMimeType} from "../../helpers/utils";

const styles = {
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
		padding: 5,
		textTransform: "none"
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

class EditorTabs extends React.Component {
	constructor(props) {
		super(props);
	}

	handleChange(event, value) {
		this.props.showFile(value, this.props.editor.id);
	}

	handleClose(e, id) {
		e.stopPropagation();
		this.props.closeTab(id, this.props.editor.id);
		this.destroyAceSession(id);
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

		console.log("Active Tab: ", activeTab);

		const file = getFileById(activeTab);
		let content;
		if (isImage(file.path)) {
		    var buffer = base64ToArrayBuffer(file.content);  
		    // const imageMeta = imageType(buffer);
		    // console.log("imageMeta: ", imageMeta);
		    const link = `data:${getMimeType(file.path)};base64,${file.content}`
			content = <img src={link} />;
		} else {
			content = <AceEditorContainer container={this} fileId={activeTab} />;
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

EditorTabs.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(EditorTabs));

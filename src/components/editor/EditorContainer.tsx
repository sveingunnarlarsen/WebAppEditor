import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withStyles} from "@material-ui/styles";
import SplitPane from "react-split-pane";

import EditorTop from "./EditorTop";
import EditorTabs from "./EditorTabs";

const styles = {
	editorContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	}
};

const mapState = (state, ownProps) => {
    const container = state.editor.containers.find(c => c.id === ownProps.containerId);
    return {container};
};

class EditorContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	createEditor(editor) {
		if (editor.isContainer) {
			return <EditorTop containerId={editor.id} />;
		} else {
			return <EditorTabs editorId={editor.id} />;
		}
	}

	render() {
		const {classes, container} = this.props;
		const {editor1, editor2, split} = container;
		
		let content;
		if (editor1 && editor2) {
			content = (
				<SplitPane split={split} defaultSize={"50%"}>
					{this.createEditor(editor1)}
					{this.createEditor(editor2)}
				</SplitPane>
			);
		} else {
			content = this.createEditor(editor1);
		}

		return <div className={classes.editorContainer}>{content}</div>;
	}
}

EditorContainer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(mapState)(withStyles(styles)(EditorContainer));

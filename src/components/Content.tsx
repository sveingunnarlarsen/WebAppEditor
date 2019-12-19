import React from "react";
import PropTypes from "prop-types";
import SplitPane from "react-split-pane";
import {connect} from "react-redux";
import {withStyles} from "@material-ui/styles";

import {resizeTool, resizeEditor, resizeTerminal} from "../actions";

import ToolContent from "./tool/ToolContent";
import EditorTop from "./editor/EditorTop";
import Preview from "./Preview";
import TerminalContainer from "./terminal/TerminalContainer";
import "./Content.css";

const styles = {
	interactive: {
		pointerEvents: "auto"
	},
	nonInteractive: {
		pointerEvents: "none"
	}
};

const mapState = state => {
	const topContainer = state.editor.containers.find(c => c.isTop);
	return {
		previewVisible: state.previewVisible,
		commandLineVisible: state.commandLineVisible,
		topContainerId: topContainer ? topContainer.id : null
	};
};

function mapDispatch(dispatch) {
	return {
		resizeTool: () => dispatch(resizeTool()),
		resizeEditor: () => dispatch(resizeEditor()),
		resizeTerminal: () => dispatch(resizeTerminal())
	};
}

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isDragging: false
		};
	}

	render() {
		const {classes, top, left, previewVisible, commandLineVisible, topContainerId} = this.props;

		let defaultPreviewSize, defaultContentSize, splitPanePreviewClass, splitPaneContentSize;

		previewVisible ? (defaultPreviewSize = "60%") : ((defaultPreviewSize = "100%"), (splitPanePreviewClass = "soloPane1"));
		commandLineVisible ? (defaultContentSize = "60%") : ((defaultContentSize = "100%"), (splitPaneContentSize = "soloPane1"));

		const useClass = this.state.isDragging ? classes.nonInteractive : classes.interactive;

		return (
			<div style={{position: "absolute", top, left, width: `calc(100% - ${left})`, height: `calc(100% - ${top})`, background: "#252526"}}>
				<SplitPane
					split="vertical"
					defaultSize={defaultPreviewSize}
					className={splitPanePreviewClass}
					onDragFinished={() => {
						this.props.resizeTool();
						this.props.resizeEditor();
						this.props.resizeTerminal();
					}}
				>
					<SplitPane
						split="horizontal"
						defaultSize={defaultContentSize}
						className={splitPaneContentSize}
						onDragFinished={() => {
							this.props.resizeTool();
							this.props.resizeEditor();
							this.props.resizeTerminal();
						}}
					>
						<SplitPane
							split="vertical"
							defaultSize={"15%"}
							onDragFinished={() => {
								this.props.resizeTool();
								this.props.resizeEditor();
							}}
						>
							<ToolContent />
							<EditorTop containerId={topContainerId} />
						</SplitPane>
						<TerminalContainer />
					</SplitPane>
					<Preview top={top} isVisible={previewVisible} useClass={useClass} />
				</SplitPane>
			</div>
		);
		/*
		// Terminal does not resize.
		return (
			<div style={{position: "absolute", top, left, width: `calc(100% - ${left})`, height: `calc(100% - ${top})`, background: "#252526"}}>
				<SplitPane split="horizontal" defaultSize={defaultContentSize} className={splitPaneContentSize} onDragStarted={() => {}} onDragFinished={() => {}}>
					<SplitPane
						split="vertical"
						defaultSize={defaultPreviewSize}
						className={splitPanePreviewClass}
						onDragStarted={() => {}}
						onDragFinished={() => {
							// Should resize ace editor horizontally
						}}
					>
						<SplitPane split="vertical" defaultSize={"15%"} onDragFinished={() => {}}>
							<ToolContent />
							<EditorTop containerId={topContainerId} />
						</SplitPane>
						<Preview top={top} isVisible={previewVisible} useClass={useClass} />
					</SplitPane>
					<TerminalContainer />
				</SplitPane>
			</div>
		);
		*/
	}
}

Content.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(mapState, mapDispatch)(withStyles(styles)(Content));

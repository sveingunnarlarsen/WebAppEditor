import React from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";

import {withStyles} from "@material-ui/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import AccountTreeIcon from "@material-ui/icons/AccountTreeOutlined";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import BrushIcon from "@material-ui/icons/Brush";
import FormatIndentIncreaseIcon from "@material-ui/icons/FormatIndentIncrease";
import VerticalSplitIcon from "@material-ui/icons/VerticalSplit";
import HorizontalSplitIcon from "@material-ui/icons/HorizontalSplit";

import {splitEditor} from "../../actions/editor";
import {SplitDirection} from "../../types/editor";

import {prettyPrint, calculatePos} from "./utils";
import {findReferences} from "../../completer";


function mapDispatch(dispatch) {
	return {
		splitEditor: (direction, editorId, fileId) => dispatch(splitEditor(direction, editorId, fileId))
	};
}

const styles = theme => ({
	root: {
		position: "fixed",
		width: "100%",
		maxWidth: 200,
		backgroundColor: theme.palette.background.paper,
		zIndex: 2000
	}
});

class EditorContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false
		};
	}

	componentDidMount() {
		this.clickArea = ReactDOM.findDOMNode(this.props.container);
		this.clickArea.addEventListener("contextmenu", this.handleContextMenu);
		document.addEventListener("contextmenu", this.handleOutsideClick);
		document.addEventListener("click", this.handleClick);
	}

	componentWillUnmount() {
		this.clickArea.removeEventListener("contextmenu", this.handleContextMenu);
		document.removeEventListener("contextmenu", this.handleOutsideClick);
		document.removeEventListener("click", this.handleClick);
	}

	handleOutsideClick = event => {
		if (this.keepOpen) {
			this.keepOpen = false;
		} else {
			this.setState({visible: false});
		}
	};

	handleContextMenu = event => {
		event.preventDefault();

		this.setState({visible: true});
		this.keepOpen = true;
		calculatePos({x: event.clientX, y: event.clientY}, this.root);
	};

	handleClick = event => {
		const {visible} = this.state;
		const wasOutside = !(event.target.contains === this.root);

		if (wasOutside && visible) this.setState({visible: false});
	};

	findReferences = () => {
		findReferences(this.props.container.ace.current.editor);
	};

	prettyPrint = () => {
		prettyPrint(this.props.container.ace.current.editor);
	};

	splitEditor = (direction, editorId, fileId) => {
		this.props.splitEditor(direction, editorId, fileId);
	};

	render() {
		const {editor, fso} = this.props.container.props;
		const {visible} = this.state;
		const {classes} = this.props;

		return (
			(visible || null) && (
				<div
					ref={ref => {
						this.root = ref;
					}}
					className={classes.root}
				>
					<List component="nav" dense disablePadding>
						<ListItem button onClick={this.findReferences}>
							<ListItemIcon>
								<AccountTreeIcon />
							</ListItemIcon>
							<ListItemText primary="Find References" />
						</ListItem>
						<ListItem button onClick={event => console.log("Not implemented")}>
							<ListItemIcon>
								<UndoIcon />
							</ListItemIcon>
							<ListItemText primary="Undo" />
						</ListItem>
						<ListItem button onClick={event => console.log("Not Implemented")}>
							<ListItemIcon>
								<RedoIcon />
							</ListItemIcon>
							<ListItemText primary="Redo" />
						</ListItem>
						<ListItem button onClick={this.prettyPrint}>
							<ListItemIcon>
								<BrushIcon />
							</ListItemIcon>
							<ListItemText primary="Beautify" />
						</ListItem>
						<ListItem button onClick={event => null}>
							<ListItemIcon>
								<FormatIndentIncreaseIcon />
							</ListItemIcon>
							<ListItemText primary="Toggle Comment" />
						</ListItem>
						<ListItem button onClick={() => () => this.splitEditor(SplitDirection.VERTICAL, editor.id, fso.id)}>
							<ListItemIcon>
								<VerticalSplitIcon />
							</ListItemIcon>
							<ListItemText primary="Split Vertically" />
						</ListItem>
						<ListItem button onClick={() => this.splitEditor(SplitDirection.HORIZONTAL, editor.id, fso.id)}>
							<ListItemIcon>
								<HorizontalSplitIcon />
							</ListItemIcon>
							<ListItemText primary="Split Horizontal" />
						</ListItem>
						<ListItem button onClick={event => null}>
							<ListItemIcon>
								<DraftsIcon />
							</ListItemIcon>
							<ListItemText primary="Api Browser" />
						</ListItem>
					</List>
				</div>
			)
		);
	}
}

export default connect(
	null,
	mapDispatch
)(withStyles(styles)(EditorContextMenu));

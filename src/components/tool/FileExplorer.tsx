import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import WebixTree from "./webix/Tree";

const styles = {
	container: {
		background: "#252526",
		width: "100%",
		height: "100%",
	},
	input: {
		color: "white"
	},
	label: {
		color: "white",
		padding: "0.5rem"
	},
	toolbar: {
		background: "#333333",
		minHeight: "2rem",
		color: "white"
	}
};

class FileExplorer extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		const {classes} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
				<WebixTree />
			</div>
		);
	}
}

FileExplorer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FileExplorer);

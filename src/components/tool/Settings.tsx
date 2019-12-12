import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import TextField from "@material-ui/core/TextField";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";

import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

const mapState = state => {
	const {name, description, type, settings} = state.app;
	return {
		name,
		description,
		type,
		settings
	};
};

const styles = {
	container: {
		padding: "1rem"
	}
};

function mapDispatch(dispatch) {
	return {};
}

class Settings extends React.Component {
	constructor(props) {
		super(props);
		const {name, description, type, settings} = props;
		this.state = {
			name,
			description,
			type,
			settings
		};
	}

	updateName = e => {
		return {};
	};

	render() {
		const {classes, name, description, type, settings} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
				<TextField
					value={name}
					onChange={this.updateName}
					label="Application Name"
					fullWidth
					margin="normal"
					variant="outlined"
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					value={description}
					onChange={this.updateDescription}
					label="Description"
					fullWidth
					margin="normal"
					variant="outlined"
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					value={type}
					onChange={this.updateType}
					label="Type"
					fullWidth
					margin="normal"
					variant="outlined"
					InputLabelProps={{
						shrink: true
					}}
				/>
			</div>
		);
	}
}

Settings.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(mapState)(withStyles(styles)(Settings));
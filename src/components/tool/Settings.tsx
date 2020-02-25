import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import TextField from "@material-ui/core/TextField";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import keydown, {Keys} from "react-keydown";
const {ENTER} = Keys;

import {updateAppData, saveAppData} from "../../actions/app";

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
	return {
		updateAppData: data => dispatch(updateAppData(data)),
		saveAppData: () => dispatch(saveAppData()),
	};
}

class Settings extends React.Component {
	constructor(props) {
		super(props);
	}
	
	updateName = e => {
		this.props.updateAppData({
			...this.props,
			name: e.target.value
		});
	};

	updateDescription = e => {
		this.props.updateAppData({
			...this.props,
			description: e.target.value
		});
	};

	updateType = e => {
		this.props.updateAppData({
			...this.props,
			type: e.target.value
		});
	};

	updateEntryPointJs = e => {
		this.props.updateAppData({
			...this.props,
			settings: {
				...this.props.settings,
				entryPoint: {
					...this.props.settings.entryPoint,
					javascript: e.target.value
				}
			}
		});
	};

	updateEntryPointHtml = e => {
		this.props.updateAppData({
			...this.props,
			settings: {
				...this.props.settings,
				entryPoint: {
					...this.props.settings.entryPoint,
					html: e.target.value
				}
			}
		});
	};

	updateRepo = e => {
		this.props.updateAppData({
			...this.props,
			settings: {
				...this.props.settings,
				git: {
					...this.props.settings.git,
					repo: e.target.value
				}
			}
		});
	};
	
	handleSubmit = e => {
	    if (e.keyCode === 13) {
	        this.props.saveAppData();
	    }
	}

	render() {
		const {name, description, type, settings} = this.props;
		const {classes} = this.props;
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
					onKeyDown={this.handleSubmit}
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
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<InputLabel shrink>Type</InputLabel>
				<Select fullWidth value={type} onChange={this.updateType}>
					<MenuItem value={"react"}>React</MenuItem>
					<MenuItem value={"vue"}>Vue</MenuItem>
				</Select>
				<TextField
					value={settings.entryPoint.javascript}
					onChange={this.updateEntryPointJs}
					label="Entrypoint JS"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					value={settings.entryPoint.html}
					onChange={this.updateEntryPointHtml}
					label="Entrypoint HTML"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					value={settings.git.repo}
					onChange={this.updateRepo}
					label="Git repository"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
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

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(Settings));

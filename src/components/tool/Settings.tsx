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
import FormLabel from "@material-ui/core/FormLabel";

import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import {getConfigUser, setConfigUser} from "../../git";

import keydown, {Keys} from "react-keydown";
const {ENTER} = Keys;

import {updateAppData, saveAppData} from "../../actions/app";

const mapState = state => {
	const {name, description, type, settings} = state.app;
	return {
		data: {
			name,
			description,
			type,
			settings
		}
	};
};

const styles = {
	container: {
		padding: "1rem",
		height: "100%",
		overflowY: "auto",
	},
	form: {
	    
	}
};

function mapDispatch(dispatch) {
	return {
		updateAppData: data => dispatch(updateAppData(data)),
		saveAppData: () => dispatch(saveAppData())
	};
}

class Settings extends React.Component {
	constructor(props) {
		super(props);
		const git = getConfigUser();
		this.state = {
			git
		};
	}

	updateData = (e, prop, ...path) => {
		const data = $.extend(true, {}, this.props.data);
		const toUpdate = path ? path.reduce((a, c) => a[c], data) : data;
		toUpdate[prop] = e.target.value;
		this.props.updateAppData(data);
	};

	updateConfig = e => {
		setConfigUser(e.target.name, e.target.value);
		this.setState({git: {[e.target.name]: e.target.value}});
	};

	handleSubmit = e => {
		if (e.keyCode === 13) {
			this.props.saveAppData();
		}
	};

	render() {
		const {name, description, type, settings} = this.props.data;
		const gitConfig = getConfigUser();
		const {classes} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
				<InputLabel shrink>Type</InputLabel>
				<Select fullWidth value={type} onChange={e => this.updateDate(e, "type")}>
					<MenuItem value={"react"}>React</MenuItem>
					<MenuItem value={"vue"}>Vue</MenuItem>
				</Select>
				<TextField
					value={name || ""}
					onChange={e => this.updateData(e, "name")}
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
					value={description || ""}
					onChange={e => this.updateData(e, "description")}
					label="Description"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					value={settings.entryPoint.javascript || ""}
					onChange={e => this.updateData(e, "javascript", "settings", "entryPoint")}
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
					value={settings.entryPoint.html || ""}
					onChange={e => this.updateData(e, "html", "settings", "entryPoint")}
					label="Entrypoint HTML"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<FormLabel>GIT</FormLabel>
				<TextField
					value={settings.git.repo || ""}
					onChange={e => this.updateData(e, "repo", "settings", "git")}
					label="Git repository"
					fullWidth
					margin="normal"
					variant="outlined"
					onKeyDown={this.handleSubmit}
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					name="name"
					value={gitConfig.name || ""}
					onChange={this.updateConfig}
					label="Name"
					fullWidth
					margin="normal"
					variant="outlined"
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					name="email"
					value={gitConfig.email || ""}
					onChange={this.updateConfig}
					label="Email"
					fullWidth
					margin="normal"
					variant="outlined"
					InputLabelProps={{
						shrink: true
					}}
				/>
				<TextField
					name="token"
					value={gitConfig.token || ""}
					onChange={this.updateConfig}
					label="Token"
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

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(Settings));

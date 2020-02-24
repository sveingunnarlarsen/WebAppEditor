import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';

import {installNpmModules, deleteNpmModules} from "../../actions/app";

const styles = {
	container: {
		background: "#252526",
		width: "100%",
		height: "100%",
		overflow: "scroll"
	},
	toolbar: {
		background: "#333333",
		minHeight: "2rem",
		color: "white"
	}
};

const mapState = state => {
	return {modules: state.app.modules};
};

function mapDispatch(dispatch) {
	return {
		update: () => dispatch(installNpmModules()),
		delete: () => dispatch(deleteNpmModules()),
	};
}

class NpmExplorer extends React.Component {
	constructor(props) {
		super(props);
	}

	createList = () => {
		const {modules} = this.props;
		return modules.map(module => (
			<li key={module.name} value={module.name}>
				{module.name}
			</li>
		));
	};
	
	render() {
		const {classes} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
				<Toolbar className={classes.toolbar}>
					<IconButton onClick={() => this.props.update()} color="inherit" size="small">
						<UpdateOutlinedIcon fontSize="small" />
					</IconButton>
					<IconButton onClick={() => this.props.delete()} color="inherit" size="small">
						<DeleteForeverOutlinedIcon fontSize="small" />
					</IconButton>
				</Toolbar>
				<ul>{this.createList()}</ul>
			</div>
		);
	}
}

NpmExplorer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(NpmExplorer));

import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import UpdateOutlinedIcon from "@material-ui/icons/UpdateOutlined";
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import ArrowUpwardOutlinedIcon from '@material-ui/icons/ArrowUpwardOutlined';
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";

import {installNpmModules, deleteNpmModules} from "../../actions/app";

const styles = {
	container: {
		background: "#252526",
		height: "100%"
	},
	toolbar: {
		background: "#333333",
		minHeight: "2rem",
		color: "white"
	},
	list: {
		height: "93%",
		overflowY: "auto",
		overflowX: "hidden"
	}
};

const mapState = state => {
	return {modules: state.modules};
};

function mapDispatch(dispatch) {
	return {
		update: () => dispatch(installNpmModules()),
		upgrade: () => dispatch(installNpmModules(true)),
		delete: () => dispatch(deleteNpmModules())
	};
}

class NpmExplorer extends React.Component {
	constructor(props) {
		super(props);
	}

	createList = modules => {
		return modules.map(module => (
			<li key={module.name} value={module.name} style={{color: module.package?.exists ? "wheat" : "white"}}>
				{module.name}
				{this.getVersionOrChildren(module)}
			</li>
		));
	};

	getVersionOrChildren = module => {
		if (module.children) {
			return <ul>{this.createList(module.children)}</ul>;
		} else {
			const style = {
				color: "white"
			};
			if (module.package.exists) {
				if (module.package.version.indexOf(module.version) > -1) {
					style.color = "wheat";
				} else {
					style.color = "red";
				}
			}
			return (
				<React.Fragment>
					: <span style={style}>{module.version}</span>
				</React.Fragment>
			);
		}
	};

	render() {
		const {classes} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
				<Toolbar className={classes.toolbar}>
					<Tooltip title="Install npm modules">
						<IconButton onClick={() => this.props.update()} color="inherit" size="small">
							<RefreshOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Upgrade npm modules">
						<IconButton onClick={() => this.props.upgrade()} color="inherit" size="small">
							<ArrowUpwardOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete npm modules">
						<IconButton onClick={() => this.props.delete()} color="inherit" size="small">
							<DeleteForeverOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Toolbar>
				<div className={classes.list}>
					<ul>{this.createList(this.props.modules)}</ul>
				</div>
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

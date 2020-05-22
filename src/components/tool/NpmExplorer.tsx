import React from "react";
import {withStyles} from "@material-ui/styles";
import {connect} from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import UpdateOutlinedIcon from "@material-ui/icons/UpdateOutlined";
import RefreshOutlinedIcon from "@material-ui/icons/RefreshOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';

import {installNpmModules, deleteNpmModules} from "../../actions/npm";
import {openDialog} from "../../actions";
import {DialogType} from "../../types/dialog";

const styles: any = {
	container: {
		background: "#252526",
		height: "100%"
	},
	toolbar: {
		background: "#333333",
		minHeight: "2rem",
		color: "white"
	},
	rightTools: {
		marginLeft: "auto",
		marginRight: -12
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
		install: () => dispatch(installNpmModules()),
		update: () => dispatch(installNpmModules(true)),
		delete: () => dispatch(deleteNpmModules()),
		add: () => dispatch(openDialog(DialogType.NPM_INSTALL)),
	};
}

interface NpmExplorerProps {
	modules: any[];

	classes: any;
	show: boolean;

	install: () => void;
	update: () => void;
	delete: () => void;
	add: () => void;
}

class NpmExplorer extends React.Component<NpmExplorerProps> {
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
						<IconButton onClick={() => this.props.install()} color="inherit" size="small">
							<RefreshOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Update npm modules">
						<IconButton onClick={() => this.props.update()} color="inherit" size="small">
							<ArrowUpwardOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete npm modules">
						<IconButton onClick={() => this.props.delete()} color="inherit" size="small">
							<DeleteForeverOutlinedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<section className={classes.rightTools}>
    					<Tooltip title="Add npm module">
    						<IconButton onClick={() => this.props.add()} color="inherit" size="small">
    							<AddOutlinedIcon fontSize="small" />
    						</IconButton>
    					</Tooltip>
					</section>
				</Toolbar>
				<div className={classes.list}>
					<ul>{this.createList(this.props.modules)}</ul>
				</div>
			</div>
		);
	}
}

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(NpmExplorer));

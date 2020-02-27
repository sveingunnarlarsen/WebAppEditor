import React from "react";
import PropTypes from "prop-types";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import VerticalSplitOutlinedIcon from "@material-ui/icons/VerticalSplitOutlined";
import ViewModuleOutlinedIcon from "@material-ui/icons/ViewModuleOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import CallToActionIcon from "@material-ui/icons/CallToActionOutlined";

import {withStyles} from "@material-ui/styles";
import {connect} from "react-redux";

import store from "../../store/index";

import {togglePreview, openDialog, toggleCommandLine, switchTool} from "../../actions";
import {closeAllTabs} from "../../actions/editor";

import {Tool} from "../../types";
import {DialogType} from "../../types/dialog";

const styles = {
	drawer: {
		background: "#333333",
		border: "none",
		zIndex: 1
	},
	icon: {
		minWidth: 0
	}
};

function mapDispatch(dispatch) {
	return {
		switchTool: tool => dispatch(switchTool(tool)),
		openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP)),
		togglePreview: () => dispatch(togglePreview()),
		closeAllTabs: () => dispatch(closeAllTabs()),
		toggleCommandLine: () => dispatch(toggleCommandLine())
	};
}

class SideMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {classes, width} = this.props;
		return (
			<Drawer variant="permanent" classes={{paper: classes.drawer}}>
				<List style={{width, top: width}}>
					<ListItem button onClick={() => this.props.switchTool(Tool.EXPLORER)}>
						<Tooltip title="File explorer">
							<ListItemIcon className={classes.icon}>
								<DescriptionOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.switchTool(Tool.SETTINGS)}>
						<Tooltip title="App settings">
							<ListItemIcon className={classes.icon}>
								<SettingsOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.switchTool(Tool.NPM)}>
						<Tooltip title="App modules">
							<ListItemIcon className={classes.icon}>
								<ViewModuleOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.openSearch()}>
						<Tooltip title="Search">
							<ListItemIcon className={classes.icon}>
								<SearchOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.togglePreview()}>
						<Tooltip title="Preview">
							<ListItemIcon className={classes.icon}>
								<VerticalSplitOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.closeAllTabs()}>
						<Tooltip title="Close all tabs">
							<ListItemIcon className={classes.icon}>
								<CloseOutlinedIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
					<ListItem button onClick={() => this.props.toggleCommandLine()}>
						<Tooltip title="Terminal">
							<ListItemIcon className={classes.icon}>
								<CallToActionIcon />
							</ListItemIcon>
						</Tooltip>
					</ListItem>
				</List>
			</Drawer>
		);
	}
}

SideMenu.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	null,
	mapDispatch
)(withStyles(styles)(SideMenu));

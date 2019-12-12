import React from "react";
import PropTypes from "prop-types";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import VerticalSplitOutlinedIcon from "@material-ui/icons/VerticalSplitOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import CallToActionIcon from '@material-ui/icons/CallToActionOutlined';

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
		minWidth: 0,
	}
};

function mapDispatch(dispatch) {
	return {
		switchTool: tool => dispatch(switchTool(tool)),
		openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP)),
		togglePreview: () => dispatch(togglePreview()),
		closeAllTabs: () => dispatch(closeAllTabs()),
		toggleCommandLine: () => dispatch(toggleCommandLine()),
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
						<ListItemIcon className={classes.icon}>
							<DescriptionOutlinedIcon />
						</ListItemIcon>
					</ListItem>
					<ListItem button onClick={() => this.props.switchTool(Tool.SETTINGS)}>
						<ListItemIcon className={classes.icon}>
							<SettingsOutlinedIcon />
						</ListItemIcon>
					</ListItem>
					<ListItem button onClick={() => this.props.openSearch()}>
						<ListItemIcon className={classes.icon}>
							<SearchOutlinedIcon />
						</ListItemIcon>
					</ListItem>
					<ListItem button onClick={() => this.props.togglePreview()}>
						<ListItemIcon className={classes.icon}>
							<VerticalSplitOutlinedIcon />
						</ListItemIcon>
					</ListItem>
					<ListItem button onClick={() => this.props.closeAllTabs()}>
						<ListItemIcon className={classes.icon}>
							<CloseOutlinedIcon />
						</ListItemIcon>
					</ListItem>
					<ListItem button onClick={() => this.props.toggleCommandLine()}>
						<ListItemIcon className={classes.icon}>
							<CallToActionIcon />
						</ListItemIcon>
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

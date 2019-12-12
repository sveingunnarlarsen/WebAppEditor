import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withStyles} from "@material-ui/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import {openDialog} from "../../actions";
import {DialogType} from "../../types/dialog";

const styles = {
	menu: {
		borderRadius: "0px"
	},
};

function mapDispatch(dispatch) {
	return {
		openDialog: type => dispatch(openDialog(type))
	};
}

class ProjectMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	handleClick = type => {
		this.props.openDialog(type);
		this.props.closeMenu();
	};

	render() {
		const {classes, anchorEl, closeMenu} = this.props;
		return (
			<Menu
				getContentAnchorEl={null}
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				anchorOrigin={{vertical: "bottom", horizontal: "center"}}
				transformOrigin={{vertical: "top", horizontal: "center"}}
				onClose={closeMenu}
				classes={{paper: classes.menu}}
			>
				<MenuItem onClick={() => this.handleClick(DialogType.PROJECT_LIST)}>
					Open
				</MenuItem>
				<MenuItem onClick={() => this.handleClick(DialogType.CREATE_PROJECT)}>
					Create
				</MenuItem>
				<MenuItem onClick={() => this.handleClick(DialogType.DELETE_PROJECT)}>
					Delete
				</MenuItem>
			</Menu>
		);
	}
}

ProjectMenu.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	null,
	mapDispatch
)(withStyles(styles)(ProjectMenu));

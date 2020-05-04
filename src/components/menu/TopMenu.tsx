import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withStyles} from "@material-ui/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Typography from '@material-ui/core/Typography';

import store from "../../store";
import ProjectMenu from "./ProjectMenu";

import {compileProject} from "../../actions/app";

const styles = {
	appBar: {
		background: "#333333",
		boxShadow: "none"
	}
};

const mapState = state => {
	return {
		appName: state.app.name
	};
};

function mapDispatch(dispatch) {
	return {
		compile: () => dispatch(compileProject())
	};
}

class TopMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			anchorEl: null
		};
	}

	handleProjectMenuToggle(event) {
		this.setState({
			anchorEl: event.currentTarget
		});
	}

	closeProjectMenu = () => {
		this.setState({
			anchorEl: null
		});
	}

	compileProject = () => {
		this.props.compile();
	}
	
	runPreview = () => {
	    window.open(`/api/webapp/${store.getState().app.id}/preview`);
	}
	
	runApp = () => {
	    window.open(`/webapp/${store.getState().app.name}`);
	}

	render() {
		const {classes} = this.props;
		return (
			<AppBar className={classes.appBar}>
				<Toolbar style={{minHeight: this.props.height, paddingLeft: this.props.height}}>
					<Button onClick={this.handleProjectMenuToggle.bind(this)} endIcon={<ArrowDropDownIcon />}>
						Project
					</Button>
					<Button onClick={this.compileProject}>
						Compile
					</Button>
					<Button onClick={this.runPreview}>
						Run Preview
					</Button>
					<Button onClick={this.runApp}>
						Run
					</Button>
		            <Typography variant="h6" style={{flexGrow: 1}}>
                        {this.props.appName}
                    </Typography>
					<ProjectMenu anchorEl={this.state.anchorEl} closeMenu={this.closeProjectMenu} />
				</Toolbar>
			</AppBar>
		);
	}
}

TopMenu.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(TopMenu));

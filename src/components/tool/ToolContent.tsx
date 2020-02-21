import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import FileExplorer from "./FileExplorer";
import NpmExplorer from "./NpmExplorer";
import Settings from "./Settings";

import {Tool} from "../../types";

const styles = {
	container: {
		height: "100%",
		overflow: "hidden",
	},
	label: {
		color: "white",
		padding: "0.5rem"
	}
};

const mapState = state => {
	return {visibleTool: state.visibleTool};
};

class ToolContent extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		const {visibleTool, classes} = this.props;
		const allProps = this.props;
		return (
			<div className={classes.container}>
				<div className={classes.label}>{visibleTool}</div>
				<FileExplorer show={visibleTool === Tool.EXPLORER ? true : false} />
				<Settings show={visibleTool === Tool.SETTINGS ? true : false} />
				<NpmExplorer show={visibleTool === Tool.NPM ? true : false} />
			</div>
		);
	}
}

ToolContent.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(mapState)(withStyles(styles)(ToolContent));

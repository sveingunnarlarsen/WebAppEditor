import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchNpmModules} from "../../actions/app";

const styles = {
	container: {
		background: "#252526",
		width: "100%",
		height: "100%",
		overflow: "scroll",
	}
};

const mapState = state => {
	return {modules: state.app.modules};
};

function mapDispatch(dispatch) {
	return {
		update: () => dispatch(fetchNpmModules())
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

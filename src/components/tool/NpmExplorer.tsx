import React from "react";
import {withStyles} from "@material-ui/styles";
import PropTypes from "prop-types";
import {connect} from "react-redux";


const styles = {
    container: {
        
    }
};

class NpmExplorer extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		const {classes} = this.props;
		const display = this.props.show ? "" : "none";
		return (
			<div style={{display}} className={classes.container}>
		        <div>This is the npm browser</div>
			</div>
		);
	}
}

NpmExplorer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NpmExplorer);

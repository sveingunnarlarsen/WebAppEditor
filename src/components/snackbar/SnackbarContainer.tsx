import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import CompilingStatus from "./CompilingStatus";
import NpmStatus from "./NpmStatus";

class SnackbarContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {classes, open} = this.props;
		return (
		    <React.Fragment>
                <CompilingStatus />
                <NpmStatus />
            </React.Fragment>
		);
	}
}

export default SnackbarContainer;

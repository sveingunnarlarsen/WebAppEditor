import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import CompilingStatus from "./CompilingStatus";
import GitCloningStatus from "./GitCloneStatus";
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
                <GitCloningStatus />
            </React.Fragment>
		);
	}
}

export default SnackbarContainer;

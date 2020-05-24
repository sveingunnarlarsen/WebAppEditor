import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import CompilingStatus from "./CompilingStatus";
import CreatingProjectStatus from "./CreatingProjectStatus";
import DeletingProjectStatus from "./DeleteProjectStatus";
import GitCloningStatus from "./GitCloneStatus";
import NpmStatus from "./NpmStatus";

class SnackbarContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <CompilingStatus />
                <NpmStatus />
                <GitCloningStatus />
                <DeletingProjectStatus />
                <CreatingProjectStatus />
            </React.Fragment>
        );
    }
}

export default SnackbarContainer;

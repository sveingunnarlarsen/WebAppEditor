import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import { deleteFolder } from "../../actions/file";

function mapDispatch(dispatch) {
    return {
        deleteFolder: () => dispatch(deleteFolder())
    };
}

interface DeleteFolderProps {
    close: () => void;
    deleteFolder: () => void;
}

class DeleteFolder extends React.Component<DeleteFolderProps> {
    constructor(props) {
        super(props);
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.close();
        this.props.deleteFolder();
    };

    render() {
        const { close } = this.props;
        return (
            <React.Fragment>
                <DialogTitle>Delete Folder</DialogTitle>
                <form onSubmit={this.handleSubmit} />
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                    <Button autoFocus={true} onClick={this.handleSubmit}>
                        OK
					</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    null,
    mapDispatch
)(DeleteFolder);

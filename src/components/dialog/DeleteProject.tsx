import React from "react";
import { connect } from "react-redux";
import { DialogTitle, DialogActions, Button } from "@material-ui/core";

import { deleteProject } from "../../actions/app";

function mapDispatch(dispatch) {
    return {
        deleteProject: () => dispatch(deleteProject())
    };
}

interface DeleteFileProps {
    close: () => void;
    deleteProject: () => void;
}

class DeleteFile extends React.Component<DeleteFileProps> {
    constructor(props) {
        super(props);
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.close();
        this.props.deleteProject();
    };

    render() {
        const { close } = this.props;
        return (
            <React.Fragment>
                <DialogTitle>Delete Project</DialogTitle>
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
)(DeleteFile);

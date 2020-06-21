import React from "react";
import { connect } from "react-redux";
import { DialogTitle, DialogActions, Button } from "@material-ui/core";

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

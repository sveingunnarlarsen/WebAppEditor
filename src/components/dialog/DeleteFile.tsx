import React from "react";
import { connect } from "react-redux";
import { DialogTitle, DialogActions, Button } from "@material-ui/core";

import { deleteFso } from "../../actions/file";

function mapDispatch(dispatch) {
    return {
        deleteFile: () => dispatch(deleteFso())
    };
}

interface DeleteFileProps extends ReturnType<typeof mapDispatch> {
    close: () => void;
}

class DeleteFile extends React.Component<DeleteFileProps> {
    constructor(props) {
        super(props);
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.close();
        this.props.deleteFile();
    };

    render() {
        const { close } = this.props;
        return (
            <React.Fragment>
                <DialogTitle>Delete File</DialogTitle>
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

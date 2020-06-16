import React from "react";
import { connect } from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { AppEditorState } from "../../types";

const mapState = (state: AppEditorState) => {
    return {
        data: state.dialog.data,
    };
};

interface AppLockedProps {
    close: () => void;
}

class AppLocked extends React.Component<AppLockedProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { close, data } = this.props;

        return (
            <React.Fragment>
                <DialogContent>
                    App is locked {JSON.stringify(data)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(mapState)(AppLocked);
import React from "react";
import { connect } from "react-redux";
import { DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@material-ui/core";

import { AppEditorState } from "../../types";
import { toggleToDisplay } from "../../actions/app";

import { formatDate } from "../../helpers/utils";

const mapState = (state: AppEditorState) => {
    return {
        user: state.resources.User,
        data: state.dialog.data,
    };
};

function mapDispatch(dispatch) {
    return {
        forceLock: () => dispatch(toggleToDisplay(true))
    }
}

interface AppLockedProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch> {
    close: () => void;
}

class AppLocked extends React.Component<AppLockedProps> {
    constructor(props) {
        super(props);
    }

    forceLock = () => {
        this.props.close();
        this.props.forceLock()
    }

    render() {
        const { close, data, user } = this.props;

        const showUnlock = user.username === data.createdBy;

        return (
            <React.Fragment>
                <DialogContent>
                    <Typography color="primary" variant="h6">
                        Application is locked
                    </Typography>
                    <Typography variant="subtitle1">
                        Locked by: {data.createdBy}
                    </Typography>
                    <Typography variant="subtitle1">
                        Locked at: {formatDate(data.createdAt)}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    {showUnlock &&
                        <Button onClick={this.forceLock}>Yes, it's me, unlock</Button>
                    }
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(mapState, mapDispatch)(AppLocked);
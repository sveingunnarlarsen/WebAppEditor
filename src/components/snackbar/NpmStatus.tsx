import React from "react";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {};

const mapState = state => {
    return {
        isUpdatingNpm: state.isUpdatingNpm
    };
};

interface NpmStatusProps extends ReturnType<typeof mapState> {
    classes: any;
}

class NpmStatus extends React.Component<NpmStatusProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes, isUpdatingNpm } = this.props;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                open={isUpdatingNpm}
                message={<span>Updating Modules</span>}
                action={[<CircularProgress key="1" />]}
            />
        );
    }
}

export default connect(mapState)(withStyles(styles)(NpmStatus));

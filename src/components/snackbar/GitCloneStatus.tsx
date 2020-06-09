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
        isCloning: state.isCloning,
    };
};

interface GitCloneStatusProps extends ReturnType<typeof mapState> {
    classes: any;
}

class GitCloneStatus extends React.Component<GitCloneStatusProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes, isCloning } = this.props;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                open={isCloning}
                message={<span>Cloning</span>}
                action={[<CircularProgress key="1" />]}
            />
        );
    }
}

export default connect(mapState)(withStyles(styles)(GitCloneStatus));

import React from "react";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";

import { AppEditorState } from "../../types"

const mapState = (state: AppEditorState) => {
    return {
        isDeleting: state.isDeleting
    };
};

interface DeletingProjectStatusProps {
    isDeleting: boolean;
}

class DeletingProjectStatus extends React.Component<DeletingProjectStatusProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { isDeleting } = this.props;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                open={isDeleting}
                message={<span>Deleting Project</span>}
                action={[<CircularProgress key="1" />]}
            />
        );
    }
}

export default connect(mapState)(DeletingProjectStatus);

import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

import { closeSnackbar } from "../../actions";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';

const styles = {
    close: {},
};

const mapStateToProp = state => {
    return {
        open: state.snackbar.fileSaved
    }
}

function mapDispatchToProp(dispatch) {
    return {
        close: () => dispatch(closeSnackbar())
    }
}

class FileSaved extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClose(e) {
        this.props.close();
    }

    render() {
        const { classes, open } = this.props;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                open={open}
                autoHideDuration={3000}
                onClose={this.handleClose.bind(this)}
                message={<span>File saved</span>}
                action={[
                    <IconButton key="close" color="inherit" className={classes.close} onClick={this.handleClose.bind(this)}>
                        <CloseIcon />
                    </IconButton>
                ]}
            />
        );
    }
}

FileSaved.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(mapStateToProp, mapDispatchToProp)(withStyles(styles)(FileSaved));

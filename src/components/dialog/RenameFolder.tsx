import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { renameFolder } from "../../actions/file";

const mapState = state => {
    const file = state.app.fileSystemObjects.find(f => f.id === state.selectedNode);
    return {
        file
    };
};

function mapDispatch(dispatch) {
    return {
        renameFolder: name => dispatch(renameFolder(name))
    };
}

interface RenameFolderProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    close: () => void;
}

class RenameFolder extends React.Component<RenameFolderProps> {
    constructor(props) {
        super(props);
        this.state = {
            value: props.file.name
        };
    }

    updateValue = e => {
        this.setState({
            value: e.target.value
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.close();
        const { file } = this.props;
        this.props.renameFolder(this.state.value);
    };

    render() {
        const { close } = this.props;
        const { value } = this.state;
        return (
            <React.Fragment>
                <DialogTitle>Rename Folder</DialogTitle>
                <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            autoFocus={true}
                            value={value}
                            onChange={this.updateValue}
                            label="Name"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                    <Button onClick={this.handleSubmit}>OK</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(RenameFolder);

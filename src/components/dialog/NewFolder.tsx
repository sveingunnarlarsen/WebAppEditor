import React from "react";
import { connect } from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { createFso } from "../../actions/file";

function mapDispatch(dispatch) {
    return {
        createFolder: name => dispatch(createFso({ type: 'folder', name }))
    };
}

interface NewFolderProps extends ReturnType<typeof mapDispatch> {
    close: () => void;
}

class NewFolder extends React.Component<NewFolderProps, {value: string, error: boolean}> {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            error: false,
        };
    }

    updateValue = e => {
        let error = false;
        if (!e.target.value) {
            error = true;
        }
        this.setState({
            value: e.target.value,
            error,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.value) {
            this.props.close();
            this.props.createFolder(this.state.value);
        } else {
            this.setState({
                error: true
            })
        }
    };

    render() {
        const { close } = this.props;
        const { value, error } = this.state;
        return (
            <React.Fragment>
                <DialogTitle>New Folder</DialogTitle>
                <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            error={error}
                            autoFocus={true}
                            value={value}
                            onChange={this.updateValue}
                            label="Foldername"
                            fullWidth
                            required
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
    null,
    mapDispatch
)(NewFolder);

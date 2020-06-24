import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { createFso } from "../../actions/file";

function mapDispatch(dispatch) {
    return {
        createFile: (name: string) => dispatch(createFso({ type: 'file', name }))
    };
}

interface NewFileProps {
    close: () => void;
    createFile: (name: string) => void;
}

class NewFile extends React.Component<NewFileProps, { value: string, error: boolean }> {
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
            this.props.createFile(this.state.value);
        } else {
            this.setState({
                error: true,
            })
        }
    };

    render() {
        const { close } = this.props;
        const { value, error } = this.state;
        return (
            <React.Fragment>
                <DialogTitle>New File</DialogTitle>
                <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            error={error}
                            autoFocus={true}
                            value={value}
                            onChange={this.updateValue}
                            label="Filename"
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
)(NewFile);

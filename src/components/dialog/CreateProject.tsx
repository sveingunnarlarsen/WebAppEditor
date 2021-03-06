import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { DialogContent, DialogTitle, DialogActions, MenuItem, InputLabel, TextField, Button, Select, Box } from "@material-ui/core";

import { project, AppEditorState } from "../../types";
import { createProject } from '../../actions/app';

function mapDispatch(dispatch) {
    return {
        createProject: (opts) => dispatch(createProject(opts))
    };
}

const mapState = (state: AppEditorState) => {
    return {
        existingProjectNames: state.apps.list.map(w => w.name),
    }
}

interface Props extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    close: () => void;
}

interface State extends project {
    missingName: boolean;
    duplicateName: boolean;
}

class CreateProject extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            type: "react",
            template: "react-typescript",
            name: "",
            description: "",
            remote: "",
            missingName: false,
            duplicateName: false,
        };
    }

    updateType = e => {
        this.setState({
            type: e.target.value,
            template: e.target.value
        });
    };
    updateTemplate = e => {
        this.setState({
            template: e.target.value
        });
    };
    updateName = e => {
        let error = false;
        if (!e.target.value) {
            error = true;
        }
        const name = e.target.value.replace(/[^\w]/gi, "");
        this.setState((prevState, props) => ({
            name,
            duplicateName: props.existingProjectNames.includes(name),
            missingName: error,
        }));
    };
    updateDescription = e => {
        this.setState({
            description: e.target.value
        });
    };
    updateRemote = e => {
        this.setState({
            remote: e.target.value
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.name) {
            this.props.createProject(this.state);
            this.props.close();
        } else {
            this.setState({
                missingName: true
            });
        }
    };

    render() {
        const { close } = this.props;
        const { type, template, name, description, remote, missingName, duplicateName } = this.state;

        return (
            <React.Fragment>
                <DialogTitle>New Project</DialogTitle>
                <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <InputLabel shrink>
                            Type
                        </InputLabel>
                        <Select fullWidth value={type} onChange={this.updateType}>
                            <MenuItem value={"react"}>React</MenuItem>
                            <MenuItem value={"vue"}>Vue</MenuItem>
                        </Select>
                        {!remote &&
                            <React.Fragment>
                                <Box pt={2} />
                                <InputLabel shrink>
                                    Template
								</InputLabel>
                            </React.Fragment>
                        }
                        {type === 'react' && !remote &&
                            <Select fullWidth value={template} onChange={this.updateTemplate}>
                                <MenuItem value={"react-typescript"}>Typescript</MenuItem>
                                <MenuItem value={"react"}>Basic</MenuItem>
                                <MenuItem value={null}>None</MenuItem>
                            </Select>
                        }
                        {type === 'vue' && !remote &&
                            <Select fullWidth value={template} onChange={this.updateTemplate}>
                                <MenuItem value={"vue"}>Basic</MenuItem>
                            </Select>
                        }
                        <Box pt={2} />
                        <TextField
                            error={missingName || duplicateName}
                            value={name}
                            onChange={this.updateName}
                            helperText={duplicateName ? 'Duplicate Project Name' : undefined}
                            fullWidth
                            required
                            label="Name"
                            margin="normal"
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                        <TextField
                            value={description}
                            onChange={this.updateDescription}
                            fullWidth
                            label="Description"
                            margin="normal"
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                        <TextField
                            value={remote}
                            onChange={this.updateRemote}
                            fullWidth
                            label="Clone Git Repository"
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
                    <Button disabled={duplicateName} onClick={this.handleSubmit}>OK</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(CreateProject);

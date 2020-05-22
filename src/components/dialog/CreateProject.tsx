import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";

import { project } from "../../types";
import { createProject } from '../../actions/app';

function mapDispatch(dispatch) {
	return {
		createProject: (opts) => dispatch(createProject(opts))
	};
}

interface CreateProjectProps {
	createProject: (opts: project) => void;
	close: () => void;
}

class CreateProject extends React.Component<CreateProjectProps, project> {
	constructor(props) {
		super(props);
		this.state = {
			type: "react",
			template: "react",
			name: "", 
			description: "",
			remote: ""
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
		this.setState({
			name: e.target.value
		});
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
		this.props.createProject(this.state);
		this.props.close();
	};

	render() {
		const { close } = this.props;
		const { type, template, name, description, remote } = this.state;
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
								<MenuItem value={"react-typescript"}>React Typescript</MenuItem>
								<MenuItem value={"react"}>Basic react</MenuItem>
							</Select>
						}
						{type === 'vue' && !remote &&
							<Select fullWidth value={template} onChange={this.updateTemplate}>
								<MenuItem value={"vue"}>Basic vue</MenuItem>
							</Select>
						}
						<Box pt={2} />
						<TextField
							value={name}
							onChange={this.updateName}
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
					<Button onClick={this.handleSubmit}>OK</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(
	null,
	mapDispatch
)(CreateProject);

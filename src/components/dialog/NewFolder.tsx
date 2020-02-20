import React from "react";
import {connect} from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import {createFile} from "../../actions/app";

function mapDispatch(dispatch) {
	return {
		createFolder: value => dispatch(createFile(value, {type: "folder"}))
	};
}

class NewFolder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ""
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
		this.props.createFolder(this.state.value);
	};

	render() {
		const {close} = this.props;
		const {value} = this.state;
		return (
			<React.Fragment>
				<DialogTitle>New Folder</DialogTitle>
				<DialogContent>
					<form onSubmit={this.handleSubmit}>
						<TextField
							autoFocus={true}
							value={value}
							onChange={this.updateValue}
							label="Foldername"
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
	null,
	mapDispatch
)(NewFolder);

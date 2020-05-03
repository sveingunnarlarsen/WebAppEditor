import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import {save} from "../../actions/file";
import {replaceNameInPath} from "../../helpers/utils";

const mapState = state => {
	const file = state.app.fileSystemObjects.find(f => f.id === state.selectedNode);
	return {
		file
	};
};

function mapDispatch(dispatch) {
	return {
		saveFile: file => dispatch(save([file]))
	};
}

class RenameFile extends React.Component {
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
		const {file} = this.props;
		this.props.saveFile({...file, path: replaceNameInPath(file.path, this.state.value)});
	};

	render() {
		const {close} = this.props;
		const {value} = this.state;
		return (
			<React.Fragment>
				<DialogTitle>Rename File</DialogTitle>
				<DialogContent>
					<form onSubmit={this.handleSubmit}>
						<TextField
							autoFocus={true}
							value={value}
							onChange={this.updateValue}
							label="Filename"
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
)(RenameFile);

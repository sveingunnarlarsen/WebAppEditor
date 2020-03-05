import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

function mapDispatch(dispatch) {
	return {
		
	};
}

class NpmInstall extends React.Component {
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
	};

	render() {
		const {close} = this.props;
		const {value} = this.state;
		return (
			<React.Fragment>
				<DialogTitle>Install npm module</DialogTitle>
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
	null,
	mapDispatch
)(NpmInstall);
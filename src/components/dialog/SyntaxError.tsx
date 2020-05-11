import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const mapState = state => {
	return {
		data: state.dialog.data
	};
};

class SyntaxError extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.data
		};
	}

	render() {
		const {close} = this.props;
		const {value} = this.state;
		return (
			<React.Fragment>
				<DialogTitle>Syntax Error</DialogTitle>
				<DialogActions>
					<Button onClick={close}>Close</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(mapState)(SyntaxError);
import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import {deleteFile} from "../../actions/app";

function mapDispatch(dispatch) {
	return {
		deleteFile: () => dispatch(deleteFile())
	};
}

class DeleteFile extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = e => {
		e.preventDefault();
		this.props.close();
		this.props.deleteFile();
	};

	render() {
		const {close} = this.props;
		return (
			<React.Fragment>
				<DialogTitle>Delete File</DialogTitle>
				<form onSubmit={this.handleSubmit} />
				<DialogActions>
					<Button onClick={close}>Close</Button>
					<Button autoFocus={true} onClick={this.handleSubmit}>
						OK
					</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(
	null,
	mapDispatch
)(DeleteFile);
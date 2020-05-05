import React from "react";
import {connect} from "react-redux";

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

class Message extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.data
		};
	}

	render() {
		const {close} = this.props;
		const {value} = this.state;
		const {message} = value;
		
		return (
			<React.Fragment>
				<DialogContent>
					<div className="content" dangerouslySetInnerHTML={{__html: message}} />
				</DialogContent>
				<DialogActions>
					<Button onClick={close}>Close</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(mapState)(Message);
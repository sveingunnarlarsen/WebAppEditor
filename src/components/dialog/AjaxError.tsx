import React from "react";
import {connect} from "react-redux";
import AceEditor from "react-ace-builds";

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

class AjaxError extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.data
		};
	}

	render() {
		const {close} = this.props;
		const {value} = this.state;
		const {status, json} = value;
		
		const title = `HTTP ${status ? status : 0}`;
		let html;
		
		console.log("ERROR OBJECT", json);
		
		try {
		    let value;
		    if (json.status) {
	            value = json.status;   
		    } else {
		        value = JSON.stringify(json);
		    }
		    
            html = value.replace(/\n/g , "<br>");

		} catch (e) {
		    console.log(e);
		    html = "Error parsing error: " + json;
		}

		return (
			<React.Fragment>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<div className="content" dangerouslySetInnerHTML={{__html: html}} />
				</DialogContent>
				<DialogActions>
					<Button onClick={close}>Close</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(mapState)(AjaxError);
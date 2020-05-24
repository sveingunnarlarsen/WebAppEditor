import React from "react";
import { connect } from "react-redux";

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

class ServerMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.data
        };
    }

    render() {
        const { close } = this.props;
        const { value } = this.state;
        const { type, json } = value;

        let html = "";
        switch (type) {
            case "npm":
                html += `STDOUT:<br><br>${json.result.stdout.replace(/\n/g, "<br>")}`;
                html += `STDERR:<br><br>${json.result.stderr.replace(/\n/g, "<br>")}`;
                break;
            default:
                html = typeof json === "string" ? json : JSON.stringify(json);
                break;
        }

        return (
            <React.Fragment>
                <DialogTitle>Message</DialogTitle>
                <DialogContent>
                    <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(mapState)(ServerMessage);

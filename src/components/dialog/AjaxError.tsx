import React from "react";
import { connect } from "react-redux";
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";

const mapState = state => {
    return {
        data: state.dialog.data
    };
};

interface AjaxErrorProps {
    data: any;
    close: () => void;
}

class AjaxError extends React.Component<AjaxErrorProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { close } = this.props;
        const { status, error, jsonError } = this.props.data;

        const title = `HTTP ${status ? status : 0}`;

        let html;
        try {
            if (jsonError) {
                html = JSON.stringify(jsonError).replace(/\n/g, "<br>");
            } else {
                html = error.statusText;
            }
        } catch (e) {
            html = `Failed to parse error: ${e.message}`;
        }

        return (
            <React.Fragment>
                <DialogTitle>{title}</DialogTitle>
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

export default connect(mapState)(AjaxError);
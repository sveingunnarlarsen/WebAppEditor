import React from "react";
import { connect } from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";

const mapState = state => {
    return {
        data: state.dialog.data
    };
};

interface ClientErrorProps {
    data: any;
    close: () => void;
}

class ClientError extends React.Component<ClientErrorProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { close } = this.props;
        const { error } = this.props.data;

        const title = `Application Error`;
        let html;
        try {
            html = `${error.message}<br><br>${error.stack}`.replace(/\n/g, "<br>");
        } catch (e) {
            html = `Error parsing error: ${e.message}`;
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

export default connect(mapState)(ClientError);

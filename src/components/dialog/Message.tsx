import React from "react";
import { connect } from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const mapState = state => {
    return {
        message: state.dialog.data.message
    };
};

interface MessageProps {
    close: () => void;
    message: string;
}

class Message extends React.Component<MessageProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { close, message } = this.props;

        return (
            <React.Fragment>
                <DialogContent>
                    <div className="content" dangerouslySetInnerHTML={{ __html: message }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(mapState)(Message);
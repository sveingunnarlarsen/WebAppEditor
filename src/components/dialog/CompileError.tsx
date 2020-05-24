import React from "react";
import { connect } from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";

import { AppEditorState } from "../../types"

const mapState = (state: AppEditorState) => {
    return {
        data: state.dialog.data
    };
};

interface CompileErrorProps {
    close: () => void;
    data: any;
}

interface CompileErrorState {
    value: any;
}

class CompileError extends React.Component<CompileErrorProps, CompileErrorState> {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.data
        };
    }

    render() {
        const { close } = this.props;
        const { value } = this.state;
        return (
            <React.Fragment>
                <DialogTitle>Compile Error</DialogTitle>
                <DialogContent><div className="content" dangerouslySetInnerHTML={{ __html: this.state.value }}></div></DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(mapState)(CompileError);

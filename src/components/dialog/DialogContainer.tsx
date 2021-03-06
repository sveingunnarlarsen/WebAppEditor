import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/styles";
import Dialog from "@material-ui/core/Dialog";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";

import SyntaxError from "./SyntaxError";
import CompileError from "./CompileError";
import CreateProject from "./CreateProject";
import Projects from "./Projects";
import NewFile from "./NewFile";
import NewFolder from "./NewFolder";
import RenameFile from "./RenameFile";
import RenameFolder from "./RenameFolder";
import DeleteFile from "./DeleteFile";
import DeleteFolder from "./DeleteFolder";
import SearchApp from "./SearchApp";
import Message from "./Message";
import ServerMessage from "./ServerMessage";
import AjaxError from "./AjaxError";
import ClientError from "./ClientError";
import DeleteProject from "./DeleteProject";
import NpmInstall from "./NpmInstall";
import AppLocked from "./AppLocked";
import AddDependency from "./AddDependency";

import { DialogType, DialogState } from "../../types/dialog";
import { closeDialog } from "../../actions";

import { KeyCodes } from "../../types/keyCodes";

const styles = {
    searchPaper: {
        minHeight: "80vh",
        maxHeight: "80vh"
    },
    refPaper: {
        minHeight: "80vh",
        maxHeight: "80vh"
    },
    projectsPaper: {
        minHeight: "80vh",
        maxHeight: "80vh"
    }
};

const mapState = state => {
    return { dialog: state.dialog };
};

function mapDispatch(dispatch) {
    return {
        close: () => dispatch(closeDialog())
    };
}

interface DialogContainerProps extends ReturnType<typeof mapDispatch> {
    dialog: DialogState;
    classes: any;
}

function PaperComponent(props) {
    return (
        <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper square={true} {...props} />
        </Draggable>
    );
}

class DialogContainer extends React.Component<DialogContainerProps> {
    constructor(props) {
        super(props);
    }

    handleComponentKeyDown = e => {
        switch (e.keyCode) {
            case KeyCodes.Escape:
                this.props.close();
                break;
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleComponentKeyDown, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleComponentKeyDown, false);
    }

    getDialogContent(dialog) {
        const { close, classes } = this.props;
        switch (dialog.type) {
            case DialogType.ADD_DEPENDENCY:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }}  open={dialog.visible}>
                        <AddDependency close={close} />
                    </Dialog>
                )
            case DialogType.CREATE_PROJECT:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <CreateProject close={close} />
                    </Dialog>
                );
            case DialogType.PROJECT_LIST:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }}  open={dialog.visible}>
                        <Projects close={close} />
                    </Dialog>
                );
            case DialogType.CREATE_FILE:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <NewFile close={close} />
                    </Dialog>
                );
            case DialogType.CREATE_FOLDER:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <NewFolder close={close} />
                    </Dialog>
                );
            case DialogType.RENAME_FILE:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <RenameFile close={close} />
                    </Dialog>
                );
            case DialogType.RENAME_FOLDER:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <RenameFolder close={close} />
                    </Dialog>
                );
            case DialogType.DELETE_FILE:
                return (
                    <Dialog maxWidth="xs" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <DeleteFile close={close} />
                    </Dialog>
                );
            case DialogType.NPM_INSTALL:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <NpmInstall close={close} />
                    </Dialog>
                );
            case DialogType.DELETE_PROJECT:
                return (
                    <Dialog maxWidth="xs" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <DeleteProject close={close} />
                    </Dialog>
                );
            case DialogType.DELETE_FOLDER:
                return (
                    <Dialog maxWidth="xs" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <DeleteFolder close={close} />
                    </Dialog>
                );
            case DialogType.SEARCH_APP:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{ paper: classes.searchPaper }} open={dialog.visible}>
                        <SearchApp close={close} />
                    </Dialog>
                );
            case DialogType.SYNTAX_ERROR:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <SyntaxError close={close} />
                    </Dialog>
                );
            case DialogType.COMPILE_ERROR:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{ margin: "auto" }} open={dialog.visible}>
                        <CompileError close={close} />
                    </Dialog>
                );
            case DialogType.MESSAGE:
                return (
                    <Dialog maxWidth="sm" PaperComponent={PaperComponent} open={dialog.visible}>
                        <Message close={close} />
                    </Dialog>
                );
            case DialogType.SERVER_MESSAGE:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{ paper: classes.refPaper }} open={dialog.visible}>
                        <ServerMessage close={close} />
                    </Dialog>
                );
            case DialogType.AJAX_ERROR:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{ paper: classes.refPaper }} open={dialog.visible}>
                        <AjaxError close={close} />
                    </Dialog>
                );
            case DialogType.CLIENT_ERROR:
                return (
                    <Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{ paper: classes.refPaper }} open={dialog.visible}>
                        <ClientError close={close} />
                    </Dialog>
                );
            case DialogType.APP_LOCKED:
                return (
                    <Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} open={dialog.visible}>
                        <AppLocked close={close} />
                    </Dialog>
                );
            default:
                return <div />;
        }
    }

    render() {
        const { dialog } = this.props;
        return <React.Fragment>{this.getDialogContent(dialog)}</React.Fragment>;
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(DialogContainer));

import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import keydown, {Keys} from "react-keydown";

import {withStyles} from "@material-ui/styles";
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
import DeleteFile from "./DeleteFile";
import SearchApp from "./SearchApp";
import ShowReferences from "./ShowReferences";
import Message from "./Message";
import ServerMessage from "./ServerMessage";
import AjaxError from "./AjaxError";
import DeleteProject from "./DeleteProject";

import {DialogType} from "../../types/dialog";
import {closeDialog} from "../../actions";

import {someFunc} from "../../helpers/utils";

const {ESC} = Keys;

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
	return {dialog: state.dialog};
};

function mapDispatch(dispatch) {
	return {
		close: () => dispatch(closeDialog())
	};
}

function PaperComponent(props) {
	return (
		<Draggable cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper square={true} {...props} />
		</Draggable>
	);
}

class DialogContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	@keydown(ESC)
	autocomplete(e) {
		this.props.close();
	}

	getDialogContent(dialog) {
		const {close, classes} = this.props;
		switch (dialog.type) {
			case DialogType.CREATE_PROJECT:
				return (
					<Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<CreateProject close={close} />
					</Dialog>
				);
			case DialogType.PROJECT_LIST:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} classes={{paper: classes.projectsPaper}} open={dialog.visible}>
						<Projects close={close} />
					</Dialog>
				);
			case DialogType.CREATE_FILE:
				return (
					<Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<NewFile close={close} />
					</Dialog>
				);
			case DialogType.CREATE_FOLDER:
				return (
					<Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<NewFolder close={close} />
					</Dialog>
				);
			case DialogType.RENAME_FILE:
				return (
					<Dialog maxWidth="sm" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<RenameFile close={close} />
					</Dialog>
				);
			case DialogType.RENAME_FOLDER:
				return null;
			case DialogType.DELETE_FILE:
				return (
					<Dialog maxWidth="xs" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<DeleteFile close={close} />
					</Dialog>
				);
			case DialogType.DELETE_PROJECT:
				return (
					<Dialog maxWidth="xs" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<DeleteProject close={close} />
					</Dialog>
				);
			case DialogType.DELETE_FOLDER:
				return null;
			case DialogType.API_BROWSER:
				return null;
			case DialogType.SEARCH_APP:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{paper: classes.searchPaper}} open={dialog.visible}>
						<SearchApp close={close} />
					</Dialog>
				);
			case DialogType.SYNTAX_ERROR:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<SyntaxError close={close} />
					</Dialog>
				);
			case DialogType.COMPILE_ERROR:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} style={{margin: "auto"}} open={dialog.visible}>
						<CompileError close={close} />
					</Dialog>
				);
			case DialogType.SHOW_REFERENCES:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{paper: classes.refPaper}} open={dialog.visible}>
						<ShowReferences close={close} />
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
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{paper: classes.refPaper}} open={dialog.visible}>
						<ServerMessage close={close} />
					</Dialog>
				);
			case DialogType.AJAX_ERROR:
				return (
					<Dialog maxWidth="lg" fullWidth={true} PaperComponent={PaperComponent} classes={{paper: classes.refPaper}} open={dialog.visible}>
						<AjaxError close={close} />
					</Dialog>
				);
			default:
				return <div />;
		}
	}

	render() {
		const {dialog} = this.props;
		return <React.Fragment>{this.getDialogContent(dialog)}</React.Fragment>;
	}
}

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(DialogContainer));

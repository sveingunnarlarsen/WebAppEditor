import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import SplitPane from "react-split-pane";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import AceEditorContainer from "../editor/AceEditorContainer";

import keydown, {Keys} from "react-keydown";
const {UP, DOWN} = Keys;

import {getLineAndContentByChar} from "../../helpers/utils";

import "./SearchApp.css";

const mapState = state => {
	return {
		references: state.dialog.data
	};
};

class ShowReferences extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedFile: null
		};
	}

	@keydown(UP)
	handleUP(e) {
		e.preventDefault();
		console.log("Updating selected file");
		this.updateSelectedFile(-1);
	}

	@keydown(DOWN)
	handleDOWN(e) {
		e.preventDefault();
		this.updateSelectedFile(1);
	}

	updateSelectedFile(next) {
		if (!this.state.selectedFile) {
			this.selectedFile = this.files[0];
		} else {
			this.selectedFile = this.state.selectedFile;
		}
		console.log("Selected file: ", this.selectedFile);
		console.log("Files", this.files);
		let index = this.files.indexOf(this.selectedFile);
		console.log("index: ", index);
		if (index < 0) {
			index = 0;
		}
		const file = this.files[index + next];
		if (file) {
			this.setState({
				selectedFile: file
			});
		}
	}

	handleClick = row => {
		this.clickUsed = true;
		this.setState({
			selectedFile: row
		});
	};

	componentDidMount() {
		const contentHeight = parseInt(window.getComputedStyle(this.contentRef).getPropertyValue("height"));
		const splitPaneHeight = `${contentHeight - 25}px`;
		this.panelRef.splitPane.style.height = splitPaneHeight;
		if (this.aceRef && this.aceRef.current) {
			this.aceRef.current.editor.resize();
		}
	}

	componentDidUpdate() {
		if (this.selectedRef && !this.clickUsed) {
			this.selectedRef.scrollIntoView(false);
		} else {
			this.clickUsed = false;
		}
		if (this.aceRef && this.aceRef.current) {
			const editor = this.aceRef.current.editor;
			editor.resize();
			console.log("Editor resize has been called");
		}
	}

	updateFileReferences(references) {
		this.files = store.getState().app.fileSystemObjects.reduce((acc, file) => {
			const reference = references.find(r => r.definition.fileName === file.path);
			if (reference) {
				acc.push({
					id: file.id,
					path: file.path,
					definition: reference.definition,
					references: reference.references
				});
			}
			return acc;
		}, []);
	}

	getEditorForFile = selectedFile => {
		if (selectedFile) {
			return (
				<React.Fragment>
					<div style={{background: "#333333", color: "white", paddingLeft: "5px", paddingBottom: "5px", paddingTop: "3px"}}>{selectedFile.path}</div>
					<AceEditorContainer
						fileId={selectedFile.id}
						handle={ref => {
							this.aceRef = ref;
						}}
					/>
				</React.Fragment>
			);
		} else {
			return <div />;
		}
	};

	render() {
		const {close, references} = this.props;

		if (!this.files) {
			this.updateFileReferences(references);
		}

		this.selectedFile = this.state.selectedFile;
		if (!this.selectedFile && this.files.length > 0) {
			this.selectedFile = this.files[0];
		}

		let alreadySelected = false;
		return (
			<React.Fragment>
				<DialogTitle>References</DialogTitle>
				<DialogContent
					ref={ref => {
						this.contentRef = ref;
					}}
				>
					<SplitPane
						ref={ref => {
							this.panelRef = ref;
						}}
						pane1Style={{maxHeight: "50%", minHeight: "50%", overflowY: "auto"}}
						pane2Style={{maxHeight: "50%", minHeight: "50%"}}
						style={{position: "relative"}}
						split="horizontal"
						defaultSize={"50%"}
					>
						<Table stickyHeader size="small">
							<TableBody>
								{this.files.map((row, index) => {
									let selected = false;
									if (this.selectedFile.id === row.id && !alreadySelected) {
									    console.log(row);
										selected = true;
										alreadySelected = true;
									}
									return (
										<TableRow ref={ref => (selected ? (this.selectedRef = ref) : null)} tabIndex={index} key={index} selected={selected} onClick={() => this.handleClick(row)}>
											<TableCell component="th" scope="row">
												{row.definition.name}
											</TableCell>
											<TableCell>{row.path}</TableCell>
											<TableCell>Count: {row.references.length}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						{this.getEditorForFile(this.selectedFile)}
					</SplitPane>
				</DialogContent>
				<DialogActions>
					<Button onClick={close}>Close</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

export default connect(mapState)(ShowReferences);

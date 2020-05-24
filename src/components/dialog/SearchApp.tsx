import React from "react";
import { connect } from "react-redux";
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

import keydown, { Keys } from "react-keydown";
const { UP, DOWN, ENTER } = Keys;

import { getLineAndContentByChar } from "../../helpers/utils";
import { showFile } from "../../actions/editor";

import "./SearchApp.css";

function mapDispatch(dispatch) {
    return {
        showFile: id => dispatch(showFile(id))
    };
}

class SearchApp extends React.Component {
    inputTimeout: number;
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            searchResult: [],
            selectedFile: null
        };
    }

    @keydown(UP)
    handleUP(e) {
        e.preventDefault();
        this.updateSelectedFile(-1);
    }

    @keydown(DOWN)
    handleDOWN(e) {
        e.preventDefault();
        this.updateSelectedFile(1);
    }

    @keydown(ENTER)
    handleENTER(e) {
        if (this.state.selectedFile) {
            this.props.close();
            this.props.showFile(this.state.selectedFile.id);
        }
    }

    handleTextFieldKeyDown = e => {
        if (e.key === "ArrowDown") {
            this.updateSelectedFile(1);
        } else if (e.key === "ArrowUp") {
            this.updateSelectedFile(-1);
        } else if (e.key === "Escape") {
            this.props.close();
        }
    };

    updateSelectedFile(next) {
        let index = this.state.searchResult.indexOf(this.state.selectedFile);
        if (index < 0) {
            index = 0;
        }
        const file = this.state.searchResult[index + next];
        if (file) {
            this.setState({
                selectedFile: file
            });
        }
    }

    updateValue = e => {
        e.preventDefault();
        this.setState({
            value: e.target.value
        });

        clearTimeout(this.inputTimeout);
        const value = e.target.value;

        this.inputTimeout = setTimeout(() => {
            console.log("Updating search result: ", value);
            this.updateSearchResult(value);
        }, 500);
    }

    updateSearchResult = value => {
        const appFiles = store.getState().app.fileSystemObjects;
        const searchResult = appFiles.reduce((acc, file) => {
            if (!file.content) return acc;

            // File contains search word. Find all occurences.
            const firstIndex = file.content.indexOf(value);
            if (firstIndex > -1) {
                let index = firstIndex;
                while (index > -1) {
                    acc.push({
                        id: file.id,
                        path: file.path,
                        index,
                        ...getLineAndContentByChar(file.content, index)
                    });
                    index = file.content.indexOf(index, value);
                }
            }
            return acc;
        }, []);
        this.setState({
            searchResult
        });
    };

    handleClick = row => {
        this.clickUsed = true;
        this.setState({
            selectedFile: row
        });
    };

    handleDoubleClick = row => {
        if (this.state.selectedFile) {
            this.props.close();
            this.props.showFile(this.state.selectedFile.id);
        }
    };

    componentDidMount() {
        const inputHeight = this.inputRef.clientHeight;
        const contentHeight = parseInt(window.getComputedStyle(this.contentRef).getPropertyValue("height"));
        const splitPaneHeight = `${contentHeight - inputHeight - 40}px`;
        this.panelRef.splitPane.style.height = splitPaneHeight;
    }

    componentDidUpdate() {
        if (this.selectedRef && !this.clickUsed) {
            this.selectedRef.scrollIntoView(false);
        } else {
            this.clickUsed = false;
        }
        if (this.aceRef && this.aceRef.current) {
            const editor = this.aceRef.current.editor;
            const file = this.selectedFile;
            editor.gotoLine(file.lineNumber, 0, true);
            editor.findAll(this.state.value);
        }
    }

    getEditorForFile = selectedFile => {
        if (selectedFile) {
            return (
                <React.Fragment>
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
        const { close } = this.props;
        const { value, searchResult } = this.state;

        this.selectedFile = this.state.selectedFile;
        if (!this.selectedFile && searchResult.length > 0) {
            this.selectedFile = searchResult[0];
        }

        let alreadySelected = false;
        return (
            <React.Fragment>
                <DialogTitle>Search</DialogTitle>
                <DialogContent
                    ref={ref => {
                        this.contentRef = ref;
                    }}
                >
                    <TextField
                        ref={ref => {
                            this.inputRef = ref;
                        }}
                        autoFocus={true}
                        value={value}
                        onChange={this.updateValue}
                        label="Find"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true
                        }}
                        onKeyDown={this.handleTextFieldKeyDown}
                    />
                    <SplitPane
                        ref={ref => {
                            this.panelRef = ref;
                        }}
                        pane1Style={{ maxHeight: "50%", minHeight: "50%", overflowY: "auto" }}
                        pane2Style={{ maxHeight: "50%", minHeight: "50%" }}
                        style={{ position: "relative" }}
                        split="horizontal"
                        defaultSize={"50%"}
                    >
                        <Table stickyHeader size="small">
                            <TableBody>
                                {searchResult.map((row, index) => {
                                    let selected = false;
                                    if (this.selectedFile.id === row.id && !alreadySelected) {
                                        selected = true;
                                        alreadySelected = true;
                                    }
                                    return (
                                        <TableRow onDoubleClick={() => this.handleDoubleClick(row)} ref={ref => (selected ? (this.selectedRef = ref) : null)} tabIndex={index} key={index} selected={selected} onClick={() => this.handleClick(row)}>
                                            <TableCell component="th" scope="row">
                                                {row.lineContent.trim()}
                                            </TableCell>
                                            <TableCell>{row.path}</TableCell>
                                            <TableCell>{row.lineNumber}</TableCell>
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

export default connect(
    null,
    mapDispatch
)(SearchApp);

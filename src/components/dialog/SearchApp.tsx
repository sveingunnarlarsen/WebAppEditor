import React from "react";
import { connect } from "react-redux";
import * as _ from "underscore";

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

import store from "../../store";
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
            selectedRow: null
        };
    }

    @keydown(UP)
    handleUP(e) {
        e.preventDefault();
        this.updateSelectedRow(-1);
    }

    @keydown(DOWN)
    handleDOWN(e) {
        e.preventDefault();
        this.updateSelectedRow(1);
    }

    @keydown(ENTER)
    handleENTER(e) {
        if (this.state.selectedRow) {
            this.props.close();
            this.props.showFile(this.state.selectedRow.id, null, null/*Should be the range*/);
        }
    }

    handleTextFieldKeyDown = e => {
        if (e.key === "ArrowDown") {
            this.updateSelectedRow(1);
        } else if (e.key === "ArrowUp") {
            this.updateSelectedRow(-1);
        } else if (e.key === "Escape") {
            this.props.close();
        }
    };

    updateSelectedRow = next => {
        let index = this.state.searchResult.indexOf(this.state.selectedRow);
        index = index < 0 ? 0: index;
        const row = this.state.searchResult[index + next];
        if (row) {
            this.setState({
                selectedRow: row,
            })
        }
    }

    updateValue = e => {
        e.preventDefault();
        this.setState({
            value: e.target.value
        });
        if (e.target.value && e.target.value.length > 1) {
            this.updateSearchResult(e.target.value);
        } else {
            this.setState({
                searchResult: [],
            })
        }
    }

    updateSearchResult = _.debounce(async (value) => {
        const appFiles = store.getState().app.fileSystemObjects;
        const searchResult = appFiles.reduce((acc, file) => {
            if (!file.content) return acc;

            const match = file.content.match(new RegExp(value, 'g'));
            // File contains search word. Find all occurences.
            if (match) {            
                let index = file.content.toLowerCase().indexOf(value.toLowerCase());                  
                while (index > -1) {
                    acc.push({
                        id: file.id,
                        path: file.path,
                        index,
                        ...getLineAndContentByChar(file.content, index)
                    });                    

                    index = file.content.toLowerCase().indexOf(value.toLowerCase(), index + 1);
                }
            }
            return acc;            
        }, []);

        this.setState({
            searchResult
        });
    }, 500);

    handleClick = row => {
        this.clickUsed = true;
        this.setState({
            selectedRow: row
        });
    };

    handleDoubleClick = row => {
        if (this.state.selectedRow) {
            this.props.close();
            this.props.showFile(this.state.selectedRow.id, null, null/*Should be range*/);
        }
    };

    componentDidMount() {
        const inputHeight = this.inputRef.clientHeight;
        const contentHeight = parseInt(window.getComputedStyle(this.contentRef).getPropertyValue("height"));
        const splitPaneHeight = `${contentHeight - inputHeight - 40}px`;
        this.panelRef.splitPane.style.height = splitPaneHeight;
    }

    componentDidUpdate() {

    }

    getEditorForFile = selectedRow => {
        if (selectedRow) {
            console.log("selectedRow: ", selectedRow);
            return (
                <React.Fragment>
                    <AceEditorContainer
                        fileId={selectedRow.id}
                        isSearch={true}
                        showLineNumber={selectedRow.lineNumber}
                        key={selectedRow.lineNumber}
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

        this.selectedRow = this.state.selectedRow;
        if (!this.selectedRow && searchResult.length > 0) {
            this.selectedRow = searchResult[0];
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
                                    if (this.selectedRow.id === row.id && this.selectedRow.index === row.index) {
                                        selected = true;
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
                        {this.getEditorForFile(this.selectedRow)}
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

import React from "react";
import ReactDOM from "react-dom";
import { withStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import * as webix from "webix/webix.js";
import * as treeUtils from "./treeUtils";
import * as treeEvents from "./treeEvents";

import TreeContextMenu from "./TreeContextMenu";

import { openDialog, setSelectedNode } from "../../../actions";
import { showFile } from "../../../actions/editor";
import { DialogType } from "../../../types/dialog";

import { convertFlatToNested } from "../../../helpers/utils";

const styles = {
    input: {
        color: "white"
    },
    label: {
        color: "white",
        padding: "0.5rem"
    },
    toolbar: {
        background: "#333333",
        minHeight: "2rem",
        color: "white"
    }
};

const mapState = state => {
    return { app: state.app, visibleTool: state.visibleTool, toolResized: state.toolResized };
};

function mapDispatch(dispatch) {
    return {
        select: id => dispatch(showFile(id)),
        newFile: () => dispatch(openDialog(DialogType.CREATE_FILE)),
        newFolder: () => dispatch(openDialog(DialogType.CREATE_FOLDER)),
        setSelectedId: id => dispatch(setSelectedNode(id))
    };
}

class WebixTree extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filter: "",
        }
    }

    collapseAll() {
        if (this.props.app.id) {
            this.ui.closeAll();
            this.ui.open("1");
        }
    }

    resize() {
        if (this.props.app.id) {
            this.ui.resize();
        }
    }

    getTreeData() {
        const { app } = this.props;
        const fsos = app.fileSystemObjects;

        if (fsos.length > 0) {
            const folders = fsos.filter(f => f.type === "folder").sort((a, b) => (a.name > b.name ? 1 : -1));
            const files = fsos.filter(f => f.type === "file").sort((a, b) => (a.name > b.name ? 1 : -1));
            const sorted = [...folders].concat([...files]);

            return convertFlatToNested(
                [
                    {
                        id: "1",
                        open: true,
                        image: "",
                        value: app.name,
                        disabled: false,
                        type: "folder"
                    }
                ].concat([...JSON.parse(JSON.stringify(sorted))]),
                "id",
                "parentId"
            );
        } else {
            return [];
        }
    }

    handleFilterChange = e => {
        this.setState({
            filter: e.target.value,
        })
        //this.ui.filter("#value", e.target.value);
    };

    render() {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Toolbar className={classes.toolbar}>
                    <Input defaultValue="" placeholder="Filter" className={classes.input} onChange={this.handleFilterChange} />
                    <Tooltip title="Expand all">
                        <IconButton onClick={() => this.ui.openAll()} color="inherit" size="small">
                            <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Collapse all">
                        <IconButton onClick={() => this.collapseAll()} color="inherit" size="small">
                            <ExpandLessIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New file">
                        <IconButton onClick={() => this.props.newFile()} color="inherit" size="small">
                            <NoteAddOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New folder">
                        <IconButton onClick={() => this.props.newFolder()} color="inherit" size="small">
                            <CreateNewFolderOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <div ref="root" style={{ height: "calc(100% - 4.3rem)", width: "100%" }} />
                <TreeContextMenu container={this} />
            </React.Fragment>
        );
    }

    componentWillUnmount() {
        this.ui.destructor();
        this.ui = null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let state;
        if (this.appId === prevProps.app.id) {
            state = this.ui.getState();
        }
        this.ui.clearAll();
        this.ui.parse(this.getTreeData());

        if (state) {
            this.ui.setState(state);
        } else {
            if (this.props.app.id) {
                this.ui.open("1");
            }
        }
        this.appId = prevProps.app.id;
        if (this.state.filter) {
            this.ui.filter("#value", this.state.filter);
        }
    }

    componentDidMount(props) {
        this.ui = webix.ui(
            treeUtils.options(ReactDOM.findDOMNode(this.refs.root), {
                type: {
                    template: treeUtils.template,
                    folder: treeUtils.folder
                },
                on: treeEvents.getEvents.bind(this)(),
                data: this.getTreeData()
            })
        );
        this.ui.sort((a, b) => {
            return a.value > b.value ? 1 : -1;
        });
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.app.fileSystemObjects.length > 0 || nextProps.app.id === "") {
            return true;
        }
        return false;
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(WebixTree));

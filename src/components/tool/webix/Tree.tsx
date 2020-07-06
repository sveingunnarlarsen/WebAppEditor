import React from "react";
import ReactDOM from "react-dom";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import TreeContextMenu from "./TreeContextMenu";
import * as webix from "webix/webix.js";
import * as treeUtils from "./treeUtils";
import * as treeEvents from "./treeEvents";

import { openDialog, setSelectedNode } from "../../../actions";
import { showFile } from "../../../actions/editor";
import { AppEditorState } from "../../../types";
import { DialogType } from "../../../types/dialog";
import { convertFlatToNested, sortFoldersAndFiles } from "../../../helpers/utils";

import "./Tree.css";

const styles = {
    toolbar: {
        minHeight: "2rem",
    }
};

const mapState = (state: AppEditorState) => {
    return {
        app: {
            id: state.app.id,
            name: state.app.name,
            fileSystemObjects: state.app.fileSystemObjects
                .map(({ id, name, value, path, type, image, disabled, parentId }) => ({ id, name, value, path, type, image, disabled, parentId }))
        },
        lock: state.app.lock,
        isDark: state.darkState,
        visibleTool: state.visibleTool,
        toolResized: state.toolResized,
    }
};

function mapDispatch(dispatch) {
    return {
        select: id => dispatch(showFile(id)),
        newFile: () => dispatch(openDialog(DialogType.CREATE_FILE)),
        newFolder: () => dispatch(openDialog(DialogType.CREATE_FOLDER)),
        setSelectedId: id => dispatch(setSelectedNode(id))
    };
}

interface WebixTreeProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch> {
    classes: any;
}

class WebixTree extends React.Component<WebixTreeProps, { filter: string }> {
    appId: string;
    ui: any;
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

        const topNode = {
            id: "1",
            open: true,
            image: "",
            value: app.name,
            disabled: false,
            type: "folder",    
            path: "/",    
        } as any;

        if (fsos.length > 0) {
            // So position doesn't change when comparing for update.
            const newArrayRef = app.fileSystemObjects.slice();            
            return convertFlatToNested([topNode].concat(newArrayRef.sort(sortFoldersAndFiles)), "id", "parentId");                        
        } else {
            return [topNode];
        }
    }

    handleFilterChange = e => {
        this.setState({
            filter: e.target.value,
        });
    };

    render() {
        const { classes, lock, isDark } = this.props;

        return (
            <React.Fragment>
                <Toolbar className={classes.toolbar}>
                    <Input defaultValue="" placeholder="Filter" onChange={this.handleFilterChange} />
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
                    {lock &&
                        <React.Fragment>
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
                        </React.Fragment>
                    }
                </Toolbar>
                <div className={isDark ? "webix_dark" : "webix_light"} ref="root" style={{ height: "calc(100% - 4.3rem)", width: "100%" }} />
                <TreeContextMenu container={this} />
            </React.Fragment>
        );
    }

    componentWillUnmount() {
        console.log("Tree component unmounting");
        this.ui.destructor();
        this.ui = null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("Tree component did update");
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

    componentDidMount() {
        console.log("Tree component did mount");
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
        webix.extend(this.ui, treeEvents.getExtensions.bind(this)(), true);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.visibleTool !== "EXPLORER") return false;

        if (this.props.isDark !== nextProps.isDark) return true;
        if (this.state.filter !== nextState.filter) return true;

        //Compare path in tree, only update when name differ.
        const a = this.props.app.fileSystemObjects;
        const b = nextProps.app.fileSystemObjects;
        if (a.length !== b.length) {
            console.log("Tree component updating because array length differ");
            return true;
        }
        for (var i = 0; i < a.length; ++i) {

            if (a[i].path !== b[i].path) {
                console.log("Tree component updating because a path is not equal b path");   
                console.log(i);
                console.log(a[i]);
                console.log(b[i]);
                return true;
            }
        }
        if (this.props.lock !== nextProps.lock) {
            console.log("Tree component updating because lock differ");
            return true;
        }
        if (this.props.visibleTool !== nextProps.visibleTool) {
            console.log("Tree component updateing because visibleTool differ")
            return true;
        }
        if (this.props.toolResized !== nextProps.toolResized) {
            console.log("Tree component updating because toolResized differ");
            return true;
        }
        return false;
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(WebixTree));

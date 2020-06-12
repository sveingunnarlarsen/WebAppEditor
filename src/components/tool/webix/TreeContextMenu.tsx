import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import { makeStyles } from "@material-ui/core/styles";

import { AppEditorState } from "../../../types";
import store from "../../../store";
import { getFileById } from "../../../store/utils";
import { openDialog } from "../../../actions";
import { createFso, createTemplateFile } from "../../../actions/file";
import { DialogType } from "../../../types/dialog";
import { importFiles } from "../../../helpers/import";
import { calculateContextPos } from "../../../helpers/utils";

import "./TreeContextMenu.css";

const mapState = (state: AppEditorState) => {
    const fsos = state.app.fileSystemObjects;
    const packageJson = fsos.find(f => f.path === "/package.json");
    const webpackDevJs = fsos.find(f => f.path === "/webpack.dev.js");
    const webpackProdJs = fsos.find(f => f.path === "/webpack.prod.js");
    return { selectedId: state.selectedNode, packageJson, webpackDevJs, webpackProdJs };
};

function mapDispatch(dispatch) {
    return {    
        newFile: () => dispatch(openDialog(DialogType.CREATE_FILE)),
        newFolder: () => dispatch(openDialog(DialogType.CREATE_FOLDER)),
        deleteFile: () => dispatch(openDialog(DialogType.DELETE_FILE)),
        renameFile: () => dispatch(openDialog(DialogType.RENAME_FILE)),
        deleteFolder: () => dispatch(openDialog(DialogType.DELETE_FOLDER)),
        renameFolder: () => dispatch(openDialog(DialogType.RENAME_FOLDER)),
        createPackageJson: () => dispatch(createTemplateFile("package.json")),
        createWebpackDevJs: () => dispatch(createTemplateFile("webpack.dev.js")),
        createWebpackProdJs: () => dispatch(createTemplateFile("webpack.prod.js")),
    };
}

const styles = theme => ({
    root: {
        position: "fixed",
        width: "100%",
        maxWidth: 200,
        backgroundColor: theme.palette.background.paper,
        zIndex: 2000
    }
});


// @ts-ignore
window.importFileInTree = async function(e) {

    const files = await importFiles(e);

    console.log("Files to import: ", files);

    for (let i = 0; i < files.length; i++) {
        store.dispatch(createFso(files[i]));
    }
    document.getElementById("importFileInTree").value = "";

};

interface TreeContextMenuProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    container: any;
    classes: any;
}

class TreeContextMenu extends React.Component<TreeContextMenuProps, { visible: boolean }> {

    private keepOpen: boolean;
    root: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
        this.props.container.handleContextMenu = this.handleContextMenu.bind(this);
    }

    componentDidMount() {
        document.addEventListener("contextmenu", this.handleOutsideClick);
        document.addEventListener("click", this.handleClick);
    }

    componentWillUnmount() {
        document.removeEventListener("contextmenu", this.handleOutsideClick);
        document.removeEventListener("click", this.handleClick);
    }

    handleOutsideClick = event => {
        if (this.keepOpen) {
            this.keepOpen = false;
        } else {
            this.setState({ visible: false });
        }
    };

    handleContextMenu = event => {
        event.preventDefault();

        this.setState({ visible: true });
        this.keepOpen = true;
        calculateContextPos({ x: event.clientX, y: event.clientY }, this.root);
    };

    handleClick = event => {
        const { visible } = this.state;
        const wasOutside = !(event.target.contains === this.root);

        if (wasOutside && visible) this.setState({ visible: false });
    };

    handleNewFile = e => {
        this.props.newFile();
    }

    handleNewFolder = e => {
        this.props.newFolder();
    }

    handleRename = e => {
        const fso = getFileById(this.props.selectedId);
        if (fso.type === "folder") {
            this.props.renameFolder();
        } else {
            this.props.renameFile();
        }
    };

    handleDelete = e => {
        const fso = getFileById(this.props.selectedId);
        if (fso.type === "folder") {
            this.props.deleteFolder();
        } else {
            this.props.deleteFile();
        }
    };

    render() {
        const { visible } = this.state;
        const { classes, renameFile, deleteFile, packageJson, webpackDevJs, webpackProdJs } = this.props;

        return (
            (visible || null) && (
                <div
                    ref={ref => {
                        this.root = ref;
                    }}
                    className={classes.root}
                >
                    <List component="nav" dense disablePadding>
                        <ListItem
                            button
                            dense
                            onClick={e => {
                                this.handleNewFile(e);
                            }}
                        >
                            <ListItemIcon>
                                <NoteAddOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="New File" />
                        </ListItem>
                        <ListItem
                            button
                            dense
                            onClick={e => {
                                this.handleNewFolder(e);
                            }}
                        >
                            <ListItemIcon>
                                <CreateNewFolderOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="New Folder" />
                        </ListItem>
                        <ListItem
                            button
                            dense
                            onClick={e => {
                                this.handleRename(e);
                            }}
                        >
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText primary="Rename" />
                        </ListItem>
                        <ListItem
                            button
                            dense
                            onClick={e => {
                                this.handleDelete(e);
                            }}
                        >
                            <ListItemIcon>
                                <DeleteIcon />
                            </ListItemIcon>
                            <ListItemText primary="Delete" />
                        </ListItem>
                        <ListItem
                            button
                            dense
                            onClick={() => {
                                document.getElementById("importFileInTree").click();
                            }}
                        >
                            <ListItemIcon>
                                <ArrowDownwardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Import" />
                        </ListItem>
                        {!packageJson &&
                            <ListItem
                                button
                                dense
                                onClick={() => {
                                    this.props.createPackageJson();
                                }}
                            >
                                <ListItemIcon>
                                    <CreateOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create package.json" />
                            </ListItem>
                        }
                        {!webpackDevJs &&
                            <ListItem
                                button
                                dense
                                onClick={() => {
                                    this.props.createWebpackDevJs();
                                }}
                            >
                                <ListItemIcon>
                                    <CreateOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create webpack.dev.json" />
                            </ListItem>
                        }
                        {!webpackProdJs &&
                            <ListItem
                                button
                                dense
                                onClick={() => {
                                    this.props.createWebpackProdJs();
                                }}
                            >
                                <ListItemIcon>
                                    <CreateOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create webpack.prod.json" />
                            </ListItem>
                        }
                    </List>
                </div>
            )
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(TreeContextMenu));

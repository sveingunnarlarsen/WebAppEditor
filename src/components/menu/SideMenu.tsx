import React from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import VerticalSplitOutlinedIcon from "@material-ui/icons/VerticalSplitOutlined";
import ViewModuleOutlinedIcon from "@material-ui/icons/ViewModuleOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import CallToActionIcon from "@material-ui/icons/CallToActionOutlined";
import RowingIcon from "@material-ui/icons/rowing";


import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

import store from "../../store/index";

import { togglePreview, openDialog, toggleCLI, switchTool } from "../../actions";
import { closeAllTabs } from "../../actions/editor";

import { Tool, AppEditorState } from "../../types";
import { DialogType } from "../../types/dialog";

const styles = {
    drawer: {
        background: "#333333",
        border: "none",
        zIndex: 1
    },
    icon: {
        minWidth: 0
    }
};

const mapState = (state: AppEditorState) => {
    return {
        appName: state.app.name,
        appLock: state.app.lock,
    }
}

function mapDispatch(dispatch) {
    return {
        switchTool: tool => dispatch(switchTool(tool)),
        openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP)),
        togglePreview: () => dispatch(togglePreview()),
        closeAllTabs: () => dispatch(closeAllTabs()),
        toggleCommandLine: () => dispatch(toggleCLI()),
    };
}

interface SideMenuProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch> {
    classes: any;
    width: any;
}

class SideMenu extends React.Component<SideMenuProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes, width, appName } = this.props;
        return (
            <Drawer variant="permanent" classes={{ paper: classes.drawer }}>
                <List style={{ width, top: width }}>
                    {appName &&
                        <React.Fragment>
                            <ListItem button onClick={() => this.props.switchTool(Tool.EXPLORER)}>
                                <Tooltip title="File explorer">
                                    <ListItemIcon className={classes.icon}>
                                        <DescriptionOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.switchTool(Tool.SETTINGS)}>
                                <Tooltip title="App settings">
                                    <ListItemIcon className={classes.icon}>
                                        <SettingsOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.switchTool(Tool.COMPILATION_DETAILS)}>
                                <Tooltip title="Compilation Details">
                                    <ListItemIcon className={classes.icon}>
                                        <RowingIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.switchTool(Tool.NPM)}>
                                <Tooltip title="App modules">
                                    <ListItemIcon className={classes.icon}>
                                        <ViewModuleOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.openSearch()}>
                                <Tooltip title="Search">
                                    <ListItemIcon className={classes.icon}>
                                        <SearchOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.togglePreview()}>
                                <Tooltip title="Preview">
                                    <ListItemIcon className={classes.icon}>
                                        <VerticalSplitOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.closeAllTabs()}>
                                <Tooltip title="Close all tabs">
                                    <ListItemIcon className={classes.icon}>
                                        <CloseOutlinedIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                            <ListItem button onClick={() => this.props.toggleCommandLine()}>
                                <Tooltip title="Terminal">
                                    <ListItemIcon className={classes.icon}>
                                        <CallToActionIcon />
                                    </ListItemIcon>
                                </Tooltip>
                            </ListItem>
                        </React.Fragment>
                    }
                </List>
            </Drawer>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(SideMenu));

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";

import { openDialog } from "../../actions";
import { DialogType } from "../../types/dialog";

import { exportProjectToZip } from "../../helpers/export";
import { importFolderZip } from "../../helpers/import";

const styles = {
    menu: {
        borderRadius: "0px"
    }
};

function mapDispatch(dispatch) {
    return {
        openDialog: type => dispatch(openDialog(type))
    };
}

interface ProjectMenuProps extends ReturnType<typeof mapDispatch> {
    closeMenu: () => void;
}

class ProjectMenu extends React.Component<ProjectMenuProps> {
    constructor(props) {
        super(props);
    }

    handleClick = type => {
        this.props.openDialog(type);
        this.props.closeMenu();
    };

    exportToZip = () => {
        this.props.closeMenu();
        exportProjectToZip();
    };

    importFolderZip = id => {
        this.props.closeMenu();
        document.getElementById(id).click();
    };

    render() {
        const { classes, anchorEl, closeMenu } = this.props;
        return (
            <Menu
                getContentAnchorEl={null}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={closeMenu}
                classes={{ paper: classes.menu }}
            >
                <MenuItem onClick={() => this.handleClick(DialogType.PROJECT_LIST)}>Open</MenuItem>
                <MenuItem onClick={() => this.handleClick(DialogType.CREATE_PROJECT)}>Create</MenuItem>
                <MenuItem onClick={() => this.handleClick(DialogType.DELETE_PROJECT)}>Delete</MenuItem>
                <Divider />
                <MenuItem onClick={this.exportToZip}>Export to zip</MenuItem>
                <MenuItem onClick={() => this.importFolderZip("importZip")}>
                    Import zip
					<input id="importZip" accept=".zip" multiple="single" type="file" style={{ display: "none" }} onChange={e => importFolderZip(e, "zip")} value="" />
                </MenuItem>
                <MenuItem onClick={() => this.importFolderZip("importFolder")}>
                    Import folder
					<input id="importFolder" mozdirectory="true" webkitdirectory="true" type="file" style={{ display: "none" }} onChange={e => importFolderZip(e, "folder")} value="" />
                </MenuItem>
                <Divider />
            </Menu>
        );
    }
}

ProjectMenu.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(
    null,
    mapDispatch
)(withStyles(styles)(ProjectMenu));

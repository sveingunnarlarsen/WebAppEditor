import React from "react";
import { connect } from "react-redux";
import { withStyles, createStyles, WithStyles } from "@material-ui/styles";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";

import { signOut } from "../../actions/app";

const styles = theme => createStyles({
    menu: {
        borderRadius: "0px"
    }
});

function mapDispatch(dispatch) {
    return {
        signOut: () => dispatch(signOut())
    };
}


interface ProjectMenuProps extends ReturnType<typeof mapDispatch> {
    classes: any;
    anchorEl: HTMLElement;
    closeMenu: () => void;
}

class ProjectMenu extends React.Component<ProjectMenuProps> {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        this.props.closeMenu();
        this.props.signOut();
    };

    render() {
        const { anchorEl, closeMenu, classes } = this.props;
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
                <MenuItem onClick={this.handleClick}>Sign Out</MenuItem>
            </Menu>
        );
    }
}

export default connect(null, mapDispatch)(withStyles(styles)(ProjectMenu));

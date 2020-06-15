import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Popover from '@material-ui/core/Popover';


import { AppEditorState } from "../../types"
import store from "../../store";
import ProjectMenu from "./ProjectMenu";

import { compileProject, compilePreview } from "../../actions/app";

const styles = theme => ({
    appBar: {
        background: "#333333",
        boxShadow: "none"
    },
    typography: {
      padding: theme.spacing(2),
    },
});

function getWarnings(state: AppEditorState) {
    const fsos = state.app.fileSystemObjects;
    const warnings = [];
    if (!fsos.find(f => f.path === "/package.json")) {
        warnings.push({                                                        
            message: "Missing package.json"
        })
    }
    if (!fsos.find(f => f.path === "/webpack.dev.js")) {
        warnings.push({
            message: "Missing webpack.dev.js"
        })
    }
    if (!fsos.find(f => f.path === "/webpack.prod.js")) {
        warnings.push({
            message: "Missing webpack.prod.js"
        })
    }
    return warnings;
}

const mapState = (state: AppEditorState) => {
    return {
        warnings: getWarnings(state),
        appName: state.app.name,
    };
};

function mapDispatch(dispatch) {
    return {
        compile: () => dispatch(compileProject()),
        compilePreview: () => dispatch(compilePreview())
    };
}

interface TopMenuProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    classes: any;
    height: any;
}

class TopMenu extends React.Component<TopMenuProps, { anchorElProjectMenu: HTMLButtonElement | null, anchorElWarning: HTMLButtonElement | null }> {
    constructor(props) {
        super(props);
        this.state = {
            anchorElProjectMenu: null,
            anchorElWarning: null,
        };
    }

    handleProjectMenuToggle(event) {
        this.setState({
            anchorElProjectMenu: event.currentTarget
        });
    }

    closeProjectMenu = () => {
        this.setState({
            anchorElProjectMenu: null
        });
    }

    handleWarningsToggle(event) {
        this.setState({
            anchorElWarning: event.currentTarget
        });
    }

    closeWarningsToggle = () => {
        this.setState({
            anchorElWarning: null,
        })
    }

    compileProject = () => {
        this.props.compile();
    }

    compilePreview = () => {
        this.props.compilePreview();
    }

    runPreview = () => {
        window.open(`/api/webapp/${store.getState().app.id}/preview`);
    }

    runApp = () => {
        window.open(`/webapp/${store.getState().app.name}`);
    }

    render() {
        const { classes, warnings, appName } = this.props;
        return (
            <AppBar className={classes.appBar}>
                <Toolbar style={{ minHeight: this.props.height, paddingLeft: this.props.height }}>
                    <Button onClick={this.handleProjectMenuToggle.bind(this)} endIcon={<ArrowDropDownIcon />}>
                        Project
					</Button>
                    <Button onClick={this.compileProject}>
                        Compile
					</Button>
                    <Button onClick={this.runApp}>
                        Run
					</Button>
                    <Divider orientation="vertical" flexItem />
                    <Button onClick={this.compilePreview}>
                        Compile Preview
					</Button>
                    <Button onClick={this.runPreview}>
                        Run Preview
					</Button>
                    <Divider orientation="vertical" flexItem />
                    {warnings.length > 0 && appName &&
                        <IconButton color="inherit" onClick={this.handleWarningsToggle.bind(this)}>
                            <Badge badgeContent={warnings.length} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    }
                    <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center' }}>
                        {appName}
                    </Typography>
                    <ProjectMenu anchorEl={this.state.anchorElProjectMenu} closeMenu={this.closeProjectMenu} />
                    <Popover
                        open={Boolean(this.state.anchorElWarning)}
                        anchorEl={this.state.anchorElWarning}
                        onClose={this.closeWarningsToggle}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        {this.props.warnings.map((warning, index) => {
                            return <Typography key={index} className={classes.typography}>{warning.message}</Typography>
                        })}                        
                    </Popover>
                </Toolbar>
            </AppBar>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(TopMenu));

import React from "react";
import { connect } from "react-redux";
import { withStyles, createStyles, WithStyles } from "@material-ui/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import Popover from '@material-ui/core/Popover';


import { AppEditorState } from "../../types"
import store from "../../store";
import ProjectMenu from "./ProjectMenu";

import { compileProject, compilePreview, toggleToEdit, toggleToDisplay } from "../../actions/app";

const styles = (theme) => createStyles({
    appBar: {
        background: "#333333",
        boxShadow: "none"
    },
    typography: {
        padding: theme.spacing(2),
    },
    button: {
        padding: theme.spacing(2),
    }
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
    if (!state.languageServerConnected) {
        warnings.push({
            message: "Language server is disconnected"
        })
    }
    return warnings;
}

const mapState = (state: AppEditorState) => {
    return {
        warnings: getWarnings(state),
        appName: state.app.name,
        appLock: state.app.lock,
        user: state.resources.User,
    };
};

function mapDispatch(dispatch) {
    return {
        compile: () => dispatch(compileProject()),
        compilePreview: () => dispatch(compilePreview()),
        toggleToEdit: () => dispatch(toggleToEdit()),
        toggleToDisplay: () => dispatch(toggleToDisplay())
    };
}

interface TopMenuProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState>, WithStyles<typeof styles> {
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
        const { classes, warnings, appName, appLock } = this.props;        
        return (
            <AppBar className={classes.appBar}>
                <Toolbar style={{ minHeight: this.props.height, paddingLeft: this.props.height }}>
                    <Button onClick={this.handleProjectMenuToggle.bind(this)} endIcon={<ArrowDropDownIcon />}>
                        Project
					</Button>
                    {appName &&
                        <React.Fragment>
                            <Button className={classes.button} onClick={this.runApp}>
                                Run
                            </Button>
                            {appLock &&
                                <Button className={classes.button} onClick={this.compileProject}>
                                    Compile
                                </Button>
                            }
                            <Divider orientation="vertical" flexItem />
                            <Button className={classes.button} onClick={this.runPreview}>
                                Run Preview
                            </Button>
                            {appLock &&
                                <Button className={classes.button} onClick={this.compilePreview}>
                                    Compile Preview
                                </Button>
                            }
                            <Divider orientation="vertical" flexItem />
                            {!appLock &&
                                <Tooltip title="Toggle to edit mode">
                                    <IconButton onClick={() => this.props.toggleToEdit()}>
                                        <LockOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                            {appLock &&
                                <Tooltip title="Toggle to display mode">
                                    <IconButton onClick={() => this.props.toggleToDisplay()}>
                                        <LockOpenOutlinedIcon />
                                    </IconButton>

                                </Tooltip>
                            }
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
                        </React.Fragment>
                    }
                    {!appName && 
                        <div style={{flexGrow: 1}}></div>
                    }
                    <Typography>
                        {this.props.user ? (this.props.user.name || this.props.user.username) : ""}
                    </Typography>
                    <IconButton>
                        <AccountCircleOutlinedIcon />
                    </IconButton>
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

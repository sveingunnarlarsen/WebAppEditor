import React from "react";
import { connect } from "react-redux";
import * as _ from "underscore";
import { withStyles, createStyles, makeStyles } from "@material-ui/styles";

import {
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
    Button,
    List,
    ListSubheader,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@material-ui/core";

import {
    ExpandMore,
    ExpandLess,
    LinkOutlined,
} from "@material-ui/icons";

import { AppEditorState } from "../../types";
import { ApiGroup, Api, ApiPaths } from "../../types/resources";
import { throwError, handleAjaxError } from "../../actions/error";

const styles = theme => createStyles({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
});

const mapState = (state: AppEditorState) => {
    return {
        apiGroups: state.resources.ApiGroups,
    }
}

function mapDispatch(dispatch) {
    return {

    };
}

interface AddDependencyProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch> {
    classes: any;
    close: () => void;
}

class AddDependency extends React.Component<AddDependencyProps, { selectedApiGroup: string, selectedApi: string }> {
    constructor(props) {
        super(props);
        this.state = {
            selectedApiGroup: null,
            selectedApi: null,
        }
    }
    
    render() {
        const { close, classes, apiGroups } = this.props;
        const { selectedApiGroup, selectedApi } = this.state;

        let apis: Api[];
        if (selectedApiGroup) {
            apis = apiGroups.find(group => group.id === selectedApiGroup).apis;
        }

        let paths: ApiPaths[];
        if (apis && selectedApi) {
            paths = apis.find(api => api.id === selectedApi).paths;
        }

        return (
            <React.Fragment>
                <DialogTitle>Add API Dependency</DialogTitle>
                <DialogContent>
                    <List
                        component="nav"
                        className={classes.root}
                    >
                    {!selectedApiGroup && !selectedApi &&
                        apiGroups.map(apiGroup => {
                            return (
                                <React.Fragment>
                                    <ListItem button onClick={() => this.setState({selectedApiGroup: apiGroup.id})}>
                                        <ListItemIcon color='primary'>
                                            <LinkOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={apiGroup.name} secondary={apiGroup.description} />                                        
                                    </ListItem>
                                </React.Fragment>
                            )

                        })                    
                    }
                    {selectedApiGroup && !selectedApi &&
                        apis.map(api => {
                            return (
                                <React.Fragment>
                                    <ListItem button onClick={() => this.setState({selectedApi: api.id})}>
                                        <ListItemIcon>
                                            <LinkOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={api.name} secondary={api.description} />                                        
                                    </ListItem>
                                </React.Fragment>
                            )

                        })                    
                    }
                    {selectedApiGroup && selectedApi &&
                        paths.map(e => {
                            return (
                                <React.Fragment>
                                    <ListItem button onClick={() => console.log("not implemented")}>
                                        <ListItemIcon>
                                            <LinkOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={e.path} secondary={e.description} />                                        
                                    </ListItem>
                                </React.Fragment>
                            )

                        })                    
                    }
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(AddDependency));
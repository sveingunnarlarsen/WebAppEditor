import React from "react";
import { connect } from "react-redux";
import * as _ from "underscore";
import {
    withStyles,
    createStyles,
    WithStyles
} from "@material-ui/styles";
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
    ListItemSecondaryAction,
    Collapse,
    Slide,
    IconButton,
    Checkbox
} from "@material-ui/core";
import {
    ExpandMore,
    ExpandLess,
    LinkOutlined,
    NavigateNextOutlined,
    NavigateBeforeOutlined,
} from "@material-ui/icons";

import { AppEditorState } from "../../types";
import { ApiGroup, Api, ApiPath } from "../../types/resources";
import { throwError, handleAjaxError } from "../../actions/error";
import { updateAppApis, saveAppData } from "../../actions/app";

const styles = theme => createStyles({
    content: {
        minHeight: '50vh',
        maxHeight: '50vh',
        overflowX: "hidden",
    },
    list: {

    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
});

const mapState = (state: AppEditorState) => {
    return {
        selectedApis: state.app.apis,
        apiGroups: state.resources.ApiGroups,
    }
}

function mapDispatch(dispatch) {
    return {
        updateAppApis: apis => dispatch(updateAppApis(apis)),
        saveAppData: () => dispatch(saveAppData(true)),
    };
}

interface AddDependencyProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch>, WithStyles<typeof styles> {
    close: () => void;
}

class AddDependency extends React.Component<AddDependencyProps, { selectedApiGroup: ApiGroup, selectedApi: Api, slideDirection: 'right' | 'left' }> {
    constructor(props) {
        super(props);
        this.state = {
            selectedApiGroup: null,
            selectedApi: null,
            slideDirection: 'right',
        }
    }

    close = () => {
        this.props.saveAppData();
        this.props.close();
    }

    setSelected = (api: Api, event: React.ChangeEvent<HTMLInputElement>) => {
        const apis = this.props.selectedApis.slice(0);
        if (event.target.checked) {
            apis.push(api);
        } else {
            const index = apis.findIndex(selectedApi => selectedApi.id === api.id);
            if (index > -1) {
                apis.splice(index, 1);
            }
        }
        this.props.updateAppApis(apis);
    }

    getApiGroup = (apiGroup: ApiGroup) => {
        return (
            <ListItem button onClick={() => this.setState({ selectedApiGroup: apiGroup, slideDirection: 'right' })}>
                <ListItemIcon color='primary'>
                    <LinkOutlined />
                </ListItemIcon>
                <ListItemText primary={apiGroup.name} secondary={apiGroup.description} />
                <ListItemSecondaryAction>
                    <NavigateNextOutlined />
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    getApi = (api: Api) => {  
        const selected: boolean = this.props.selectedApis.some(selectedApi => selectedApi.id === api.id);
        return (            
                <ListItem button onClick={() => this.setState({ selectedApi: api, slideDirection: 'right' })}>
                    <ListItemSecondaryAction>
                    </ListItemSecondaryAction>
                    <ListItemIcon>
                        <LinkOutlined />
                    </ListItemIcon>
                    <ListItemText primary={api.name} secondary={api.description} />
                    <ListItemSecondaryAction>
                        <Checkbox
                            checked={selected}
                            onChange={(event) => {this.setSelected(api, event)}}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
        )
    }

    getApiPath = (path: ApiPath) => {
        return (
            <ListItem button onClick={() => console.log("not implemented")}>
                <ListItemIcon>
                    <LinkOutlined />
                </ListItemIcon>
                <ListItemText primary={path.path} secondary={path.description} />
            </ListItem>
        )
    }

    render() {
        const { close, classes, apiGroups } = this.props;
        const { selectedApiGroup, selectedApi, slideDirection } = this.state;

        console.log("Rendering: ", apiGroups, selectedApiGroup, selectedApi);


        return (
            <React.Fragment>
                <DialogTitle>Add API Dependency</DialogTitle>
                <DialogContent className={classes.content}>
                    {(!!selectedApiGroup || !!selectedApi) &&
                        <IconButton onClick={() => !!selectedApi ? this.setState({selectedApi: null, slideDirection: 'left'}) : this.setState({selectedApiGroup: null, slideDirection: 'left'})}>
                            <NavigateBeforeOutlined />
                        </IconButton>
                    }
                    <List
                        className={classes.list}
                        subheader={
                            <ListSubheader>
                            </ListSubheader>
                        }
                    >
                        {!selectedApiGroup && !selectedApi &&
                            apiGroups.map(apiGroup => {
                                return (
                                    <Slide key={apiGroup.id} direction={slideDirection} in={true} mountOnEnter unmountOnExit>
                                        {this.getApiGroup(apiGroup)}
                                    </Slide>
                                )
                            })
                        }
                        {selectedApiGroup && !selectedApi &&
                            selectedApiGroup.apis.map(api => {
                                return (
                                    <Slide key={api.id} direction={slideDirection} in={true} mountOnEnter unmountOnExit>
                                        {this.getApi(api)}
                                    </Slide>
                                )
                            })
                        }
                        {selectedApiGroup && selectedApi &&
                            selectedApi.paths.map(path => {
                                return (
                                    <Slide key={path.id} direction={slideDirection} in={true} mountOnEnter unmountOnExit>
                                        {this.getApiPath(path)}
                                    </Slide>
                                )
                            })
                        }
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(AddDependency));
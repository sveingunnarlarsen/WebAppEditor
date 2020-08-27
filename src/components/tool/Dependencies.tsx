import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import { Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { AddOutlined, DeleteOutlineOutlined } from "@material-ui/icons";

import { openDialog } from "../../actions";
import { AppEditorState } from "../../types";
import { Api } from "../../types/resources";
import { DialogType } from "../../types/dialog";
import { updateAppApis, saveAppData } from "../../actions/app";

const mapState = (state: AppEditorState) => {
    return {
        apis: state.app.apis,
    }
}

function mapDispatch(dispatch) {
    return {
        open: () => dispatch(openDialog(DialogType.ADD_DEPENDENCY)),
        updateAppApis: apis => dispatch(updateAppApis(apis)),
        saveAppData: () => dispatch(saveAppData(true)),
    }
}

const styles = {
    input: {
        color: "white"
    },
    label: {
        color: "white",
        padding: "0.5rem"
    },
    toolbar: {
        minHeight: "2rem",
    }
};

interface DependenciesProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    classes: any;
}

class Dependencies extends React.Component<DependenciesProps> {

    deleteApi = (api: Api) => {
        const apis = this.props.apis.slice(0);
        const index = apis.findIndex(selectedApi => selectedApi.id === api.id);
        if (index > -1) {
            apis.splice(index, 1);
        }
        this.props.updateAppApis(apis);
        this.props.saveAppData();
    }

    getSelectedApis = () => {
        return this.props.apis.map(api => {
            return (
                <ListItem>
                    <ListItemText primary={api.name} />
                    <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => {this.deleteApi(api)}}>
                            <DeleteOutlineOutlined />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )
        })
    }

    render() {
        const { classes } = this.props;

        return (       
            <React.Fragment>     
            <Toolbar className={classes.toolbar}>
                <Typography>Dependencies</Typography>
                <div style={{flexGrow: 1}}></div>
                <IconButton size="small" onClick={() => this.props.open()}>
                    <AddOutlined fontSize="small" />
                </IconButton>
            </Toolbar>
            <List dense={true}>
                {this.getSelectedApis()}
            </List>
            </React.Fragment>
        )
    }
}

export default connect(mapState, mapDispatch)(withStyles(styles)(Dependencies));
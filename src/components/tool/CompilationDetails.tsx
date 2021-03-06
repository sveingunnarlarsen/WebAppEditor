import React from 'react';
import { withStyles, WithStyles } from "@material-ui/styles";
import { connect } from 'react-redux';
import { AppEditorState } from '../../types/index'
import FolderIcon from '@material-ui/icons/Folder'
import { Link, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core';
import { getFileTypeImageData } from '../../helpers/utils';
import { extname } from 'path';

function mapState(state: AppEditorState) {
    return {
        app: state.app,
        compilationDetails: state.compilationDetails
    }
}

function mapDispatch(dispatch) {
    return {

    }
}

const styles: any = {
    container: {
        height: '100%',
    },
    list: {
        maxHeight: "40%",
        overflowX: "hidden",
    },
    icon: {
        height: '30px'
    },
    toolbar: {
        minHeight: "2rem",
    },
}

interface Props extends ReturnType<typeof mapState> {
    show: boolean;
    classes: any;
}

class CompilationDetails extends React.Component<Props>{

    constructor(props) {
        super(props);
    }

    createList = (paths: string[], production: boolean) => {
        let baseLink = `${location.origin}/api/webapp/${this.props.app.id}/preview`;
        if (production) baseLink = `${location.origin}/webapp/${this.props.app.name}`;
        const { classes } = this.props;
        return paths.map(path => {
            const link = baseLink + path;
            return (
                <ListItem key={path} button onClick={() => window.open(link, "_blank")}>
                    <ListItemIcon>
                        <img className={classes.icon} src={getFileTypeImageData(extname(path).substr(1))} />
                    </ListItemIcon>
                    <ListItemText primary={path} />
                </ListItem>
            )
        });
    }

    render() {
        const { production, development } = this.props.compilationDetails;
        const { classes } = this.props;
        return (
            <div className={classes.container} hidden={!this.props.show} >
                <Toolbar className={classes.toolbar}>
                    <Typography>Development</Typography>
                </Toolbar>
                <List className={classes.list} dense={true}>
                    {this.createList(development.assets, false)}
                </List>
                <Toolbar className={classes.toolbar}>
                    <Typography>Production</Typography>
                </Toolbar>
                <List className={classes.list} dense={true}>
                    {this.createList(production.assets, true)}
                </List>
            </div>
        );
    }

}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(CompilationDetails));

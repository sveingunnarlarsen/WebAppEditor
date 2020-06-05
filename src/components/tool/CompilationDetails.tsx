import React from 'react';
import { withStyles, WithStyles } from "@material-ui/styles";
import { connect } from 'react-redux';
import { AppEditorState } from '../../types/index'
import FolderIcon from '@material-ui/icons/Folder'
import { Link, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { getFileTypeImageData } from '../../helpers/utils';
import { extname } from 'path';

function mapState(state: AppEditorState) {
    return {
        appId: state.app.id,
        compilationDetails: state.compilationDetails
    }
}

function mapDispatch(dispatch) {
    return {

    }
}

const styles: any = {
    list: {
        height: "93%",
        overflowY: "auto",
        overflowX: "hidden",
    },
    icon: {
        height: '30px'
    }
}

interface Props extends ReturnType<typeof mapState> {
    show: boolean;
    classes: any;
}

class CompilationDetails extends React.Component<Props>{

    constructor(props) {
        super(props);
    }

    createList = (paths: string[]) => {
        const baseLink = `${location.origin}/api/webapp/${this.props.appId}/preview`;
        const { classes } = this.props;
        return paths.map(path => (
            <ListItem key={path} button onClick={ () => window.open(baseLink+ path, "_blank") }>
                <ListItemIcon>
                    <img className={classes.icon} src={getFileTypeImageData(extname(path).substr(1))} />
                </ListItemIcon>
                <ListItemText primary={path} />
            </ListItem>
        ));
    }

    render() {
        const { assets } = this.props.compilationDetails;
        const {classes} = this.props;
        return (
            <List hidden={!this.props.show} className={classes.list} dense={true}>
                {this.createList(assets)}
            </List>
        );
    }

}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(CompilationDetails));

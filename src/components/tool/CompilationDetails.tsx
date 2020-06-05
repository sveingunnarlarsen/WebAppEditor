import React from 'react';
import { withStyles, WithStyles } from "@material-ui/styles";
import { connect } from 'react-redux';
import {AppEditorState} from '../../types/index'
import {Link} from '@material-ui/core';

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
        overflowX: "hidden"
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
        const {classes} = this.props;
        return paths.map(path => (
            <li className={classes.listItem} key={path}>
                <Link href={baseLink + path} target="_blank">{path}</Link>
            </li>
        ));
    }

    render() {
        const display = this.props.show ? "" : "none";
        const {assets} = this.props.compilationDetails;
        return (
            <div style={{display}}>
                <p> If Jørgen could code, then this is where your assets would be! </p>
                <ul>
                    {this.createList(assets)}
                </ul>
            </div>
        );
    }

}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(CompilationDetails));

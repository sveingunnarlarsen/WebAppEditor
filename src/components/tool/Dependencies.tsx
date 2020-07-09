import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import { Toolbar, Typography, IconButton } from "@material-ui/core";
import { AddOutlined } from "@material-ui/icons";
import { openDialog } from "../../actions";
import { AppEditorState } from "../../types";
import { DialogType } from "../../types/dialog";

const mapState = (state: AppEditorState) => {
    return {

    }
}

function mapDispatch(dispatch) {
    return {
        open: () => dispatch(openDialog(DialogType.ADD_DEPENDENCY)),
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

interface DependenciesProps extends ReturnType<typeof mapDispatch>{
    classes: any;
}

class Dependencies extends React.Component<DependenciesProps> {
    render() {
        const { classes } = this.props;

        return (
            <Toolbar className={classes.toolbar}>
                <Typography>Dependencies</Typography>
                <div style={{flexGrow: 1}}></div>
                <IconButton size="small" onClick={() => this.props.open()}>
                    <AddOutlined fontSize="small" />
                </IconButton>
            </Toolbar>
        )
    }
}

export default connect(mapState, mapDispatch)(withStyles(styles)(Dependencies));



/*
<Toolbar className={classes.toolbar}>
    <Input defaultValue="" placeholder="Filter" className={classes.input} onChange={this.handleFilterChange} />
    <Tooltip title="Expand all">
        <IconButton onClick={() => this.ui.openAll()} color="inherit" size="small">
            <ExpandMoreIcon fontSize="small" />
        </IconButton>
    </Tooltip>
    <Tooltip title="Collapse all">
        <IconButton onClick={() => this.collapseAll()} color="inherit" size="small">
            <ExpandLessIcon fontSize="small" />
        </IconButton>
    </Tooltip>
    {lock &&
        <React.Fragment>
            <Tooltip title="New file">
                <IconButton onClick={() => this.props.newFile()} color="inherit" size="small">
                    <NoteAddOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="New folder">
                <IconButton onClick={() => this.props.newFolder()} color="inherit" size="small">
                    <CreateNewFolderOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </React.Fragment>
    }
</Toolbar>
*/
import React from "react";
import { withStyles } from "@material-ui/styles";
import SplitPane from "react-split-pane";
import { connect } from "react-redux";

import Toolbar from "@material-ui/core/Toolbar";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined";

import Dependencies from "./Dependencies";
import WebixTree from "./webix/Tree";

import { getResizerHorizontalCss } from "../../css/inline";

const styles = {
    container: {
        width: "100%",
        height: "100%",
        position: "relative",
    }
};

interface FileExplorerProps {
    classes: any;
    show: boolean;
}

class FileExplorer extends React.Component<FileExplorerProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;
        const display = this.props.show ? "" : "none";
        return (
            <div style={{ display }} className={classes.container}>
                <SplitPane
                    split="horizontal"
                    defaultSize={"80%"}
                    resizerStyle={getResizerHorizontalCss()}
                    onDragFinished={() => {

                    }}
                >
                    <div className={classes.container}><WebixTree /></div>
                    <div className={classes.container}><Dependencies /></div>
                </SplitPane>
            </div>
        );
    }
}

export default withStyles(styles)(FileExplorer);

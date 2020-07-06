import React from "react";
import { withStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import { connect } from "react-redux";

import { AppEditorState } from "../../types";

import CompilationDetails from "./CompilationDetails";
import FileExplorer from "./FileExplorer";
import NpmExplorer from "./NpmExplorer";
import Settings from "./Settings";

import { Tool } from "../../types";

const styles = {
    container: {
        height: "100%",
        width: "100%"
    },
    header: {
        padding: "0.5rem",
    }
};

const mapState = (state: AppEditorState) => {
    return { visibleTool: state.visibleTool, appName: state.app.name };
};

interface ToolContentProps extends ReturnType<typeof mapState> {
    classes: any;
}

class ToolContent extends React.Component<ToolContentProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { visibleTool, classes, appName } = this.props;

        return (
            <React.Fragment>
                {appName &&
                    <div className={classes.container}>
                        <Typography className={classes.header}>{visibleTool}</Typography>
                        <FileExplorer show={visibleTool === Tool.EXPLORER} />
                        <Settings show={visibleTool === Tool.SETTINGS} />
                        <NpmExplorer show={visibleTool === Tool.NPM} />
                        <CompilationDetails show={visibleTool === Tool.COMPILATION_DETAILS} />
                    </div>
                }
                {!appName &&
                    <div className={classes.container}></div>
                }
            </React.Fragment>
        );
    }
}

export default connect(mapState)(withStyles(styles)(ToolContent));

import React from "react";
import { withStyles } from "@material-ui/styles";
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
        overflow: "hidden",
    },
    label: {
        color: "white",
        padding: "0.5rem"
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
                        <div className={classes.label}>{visibleTool}</div>
                        <FileExplorer show={visibleTool === Tool.EXPLORER ? true : false} />
                        <Settings show={visibleTool === Tool.SETTINGS ? true : false} />
                        <NpmExplorer show={visibleTool === Tool.NPM ? true : false} />
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

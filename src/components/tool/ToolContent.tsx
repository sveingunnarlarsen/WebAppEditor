import React from "react";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";

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

const mapState = state => {
    return { visibleTool: state.visibleTool };
};

interface ToolContentProps {
    visibleTool: Tool,
    classes: any;
}

class ToolContent extends React.Component<ToolContentProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { visibleTool, classes } = this.props;
        const allProps = this.props;
        return (
            <div className={classes.container}>
                <div className={classes.label}>{visibleTool}</div>
                <FileExplorer show={visibleTool === Tool.EXPLORER ? true : false} />
                <Settings show={visibleTool === Tool.SETTINGS ? true : false} />
                <NpmExplorer show={visibleTool === Tool.NPM ? true : false} />
            </div>
        );
    }
}

export default connect(mapState)(withStyles(styles)(ToolContent));

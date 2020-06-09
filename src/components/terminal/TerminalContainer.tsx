import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

import TerminalLocal from "./TerminalLocal";
import TerminalServer from "./TerminalServer";

const styles = {
    toolbar: {
        color: "white",
        backgroundColor: "#252526",
    }
}

class TerminalContainer extends React.Component<{classes: any}, {visibleCommandLine: 'Git' | 'Server'}> {
    containerRef: HTMLElement;
    constructor(props) {
        super(props);
        this.state = {
            visibleCommandLine: "Git",
        }
    }

    getTerminal = () => {
        const { visibleCommandLine } = this.state;
        if (visibleCommandLine === "Server") {
            return <TerminalServer container={this} />;
        }
        else if (visibleCommandLine === "Git") {
            return <TerminalLocal container={this} />;
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div ref={ref => { this.containerRef = ref }}>
                <Toolbar style={{ minHeight: "32px" }} className={classes.toolbar}>
                    <Button onClick={() => this.setState({ visibleCommandLine: "Git" })} color="inherit">Git</Button>
                    <Button onClick={() => this.setState({ visibleCommandLine: "Server" })} color="inherit">Server</Button>
                </Toolbar>
                {this.getTerminal()}
            </div>
        );
    }
}

export default withStyles(styles)(TerminalContainer);
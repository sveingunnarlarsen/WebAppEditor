import React from "react";
import {connect} from "react-redux";
import {withStyles} from "@material-ui/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

import TerminalLocal from "./TerminalLocal";
import TerminalServer from "./TerminalServer";

const styles = {
    toolbar: {
        color: "white",
    }
}

class TerminalContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		    visibleCommandLine: "Git",
		}
	}
	
	getTerminal = () => {
	    const {visibleCommandLine} = this.state;
	    if (visibleCommandLine === "Server") {
	        return <TerminalServer />;
	    }
	    else if (visibleCommandLine === "Git") {
	        return <TerminalLocal />;
	    }
	}

	render() {
	    const {classes} = this.props;
		return (
			<React.Fragment>
					<Toolbar className={classes.toolbar}>
						<Button onClick={() => this.setState({visibleCommandLine: "Git"})} color="inherit">Git</Button>
						<Button onClick={() => this.setState({visibleCommandLine: "Server"})} color="inherit">Server</Button>
					</Toolbar>
				{this.getTerminal()}
			</React.Fragment>
		);
	}
}

export default withStyles(styles)(TerminalContainer);
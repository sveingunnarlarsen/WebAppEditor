import React, {useState, useEffect} from "react";
import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import {events, createServerTerminal, sendData} from "../../terminal";

import "xterm/css/xterm.css";

class XTerminal extends React.Component {
	constructor(props) {
		super(props);
		this.terminal = new Terminal({
			cursorBlink: true
		});
		this.fitAddon = new FitAddon();
		this.terminal.loadAddon(this.fitAddon);
		
		createServerTerminal();
		events.on('created', this.onTerminalCreated);
		events.on("data", this.onTerminalData);
	}
	
	onTerminalCreated = data => {
	    this.terminal.write(data);
	}
	
	onTerminalData = data => {
	    console.log(data.toString());
        this.terminal.write(data);
    }

	componentDidMount() {
		this.terminal.open(this.terminalRef);
		this.fitAddon.fit();
		this.terminal.onData(data => sendData(data));
	}
	
	componentWillUnmount() {
	    events.off('created', this.onTerminalCreated);
	    events.off('data', this.onTerminalData);
	}

	render() {
		return (
			<div
				ref={ref => {
					this.terminalRef = ref;
				}}
			/>
		);
	}
}

export default XTerminal;

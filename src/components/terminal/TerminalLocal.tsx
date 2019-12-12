import React, {useState, useEffect} from "react";
import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import LocalEchoController from "local-echo";
import {runCommand} from "../../git";

import "xterm/css/xterm.css";

class TerminalLocal extends React.Component {
	constructor(props) {
		super(props);
		this.terminal = new Terminal({
			cursorBlink: true
		});
		
		this.fitAddon = new FitAddon();
		this.terminal.loadAddon(this.fitAddon);
		this.localEcho = new LocalEchoController(this.terminal);
	}

	ready = () => {
		this.localEcho
			.read("~$")
			.then(input => this.handleLineFeed(input))
			.catch(error => alert(`Error reading: ${error}`));
	};

    handleLineFeed = async input => {
        try {
            const result = await runCommand(input);
            if (result) {
                this.localEcho.println(result);
            }
        } catch (e) {
            this.localEcho.println(e.message);
        }
        
        this.ready();
    }

	componentDidMount() {
		this.terminal.open(this.terminalRef);
		this.fitAddon.fit();
        this.ready();
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

export default TerminalLocal;

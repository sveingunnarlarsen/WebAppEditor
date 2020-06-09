import React, { useState, useEffect } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import LocalEchoController from '../../local-echo/LocalEchoController';

import "xterm/css/xterm.css";

class XTerminal extends React.Component {
    terminalRef: HTMLElement;
    terminal: Terminal;
    fitAddon: FitAddon;
    localEcho: LocalEchoController;
    
    constructor(props) {
        super(props);
        this.terminal = new Terminal({
            cursorBlink: true,
        });
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        this.localEcho = new LocalEchoController(this.terminal);
    }

    ready = () => {
        this.localEcho.read("~$ ")
            .then(input => this.handleLineFeed(input))
            .catch(error => alert(`Error reading: ${error}`));
    }

    handleLineFeed = input => {
        if (input) {
            this.localEcho.println(input);
        }
        this.ready();
    }

    componentDidMount() {
        this.terminal.open(this.terminalRef);
        this.fitAddon.fit();

        // Read a single line from the user
        this.localEcho.read("~$ ")
            .then(input => this.handleLineFeed(input))
            .catch(error => alert(`Error reading: ${error}`));
    }

    componentDidUpdate() {

    }

    render() {
        return <div ref={ref => { this.terminalRef = ref }}></div>
    }
}

export default XTerminal;
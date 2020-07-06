import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { events, createServerTerminal, sendData } from "../../terminal";

import "xterm/css/xterm.css";

const mapState = state => {
    return { terminalResized: state.terminalResized, commandLineVisible: state.commandLineVisible };
};

class XTerminal extends React.Component {
    terminal: Terminal;
    fitAddon: FitAddon;
    terminalRef: HTMLElement;
    container: any;
    constructor(props) {
        super(props);
        this.terminal = new Terminal({
            cursorBlink: true
        });
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        this.container = props.container;

        createServerTerminal();
        events.on("created", this.onTerminalCreated);
        events.on("data", this.onTerminalData);
    }

    onTerminalCreated = data => {
        this.terminal.write(data);
    };

    onTerminalData = data => {
        this.terminal.write(data);
    };

    componentDidMount() {
        this.terminal.open(this.terminalRef);
        this.terminal.onData(data => sendData(data));
    }

    componentWillUnmount() {
        events.off("created", this.onTerminalCreated);
        events.off("data", this.onTerminalData);
    }

    componentDidUpdate() {
        setTimeout(() => {
            this.setHeight();
        }, 0);
    }

    setHeight() {
        if (this.container && this.container.containerRef) {
            const parent = this.container.containerRef.parentNode.parentNode.offsetHeight;
            const sibling = this.container.containerRef.parentNode.parentNode.children[0].offsetHeight;
            const height = parent - sibling;
            this.terminalRef.style.height = height - 40 + "px";
        }
        this.fitAddon.fit();
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

export default connect(mapState)(XTerminal);
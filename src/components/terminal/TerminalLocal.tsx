import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import LocalEchoController from '../../local-echo/LocalEchoController';
import {resizeTerminal} from "../../actions";
import {runCommand} from "../../git";

import "xterm/css/xterm.css";

const mapState = state => {
	return {terminalResized: state.terminalResized, commandLineVisible: state.commandLineVisible};
};

function mapDispatch(dispatch) {
	return {
		resizeTerminal: () => dispatch(resizeTerminal())
	};
}

class TerminalLocal extends React.Component {
	constructor(props) {
		super(props);
		this.terminal = new Terminal({
			cursorBlink: true
		});

		this.fitAddon = new FitAddon();
		this.terminal.loadAddon(this.fitAddon);
		this.localEcho = new LocalEchoController(this.terminal);
		this.container = props.container;

		window.terminalLocal = this.terminal;
		window.terminalAddon = this.fitAddon;
	}

	ready = () => {
		this.localEcho
			.read("~$")
			.then(input => this.handleLineFeed(input))
			.catch(error => alert(`Error reading: ${error}`));
	};

	handleLineFeed = async input => {
		try {
			const result = await runCommand(input, this.localEcho.println.bind(this.localEcho));
			if (result) {
				this.localEcho.println(result);
			}
		} catch (e) {
			this.localEcho.println(e.message);
		}

		this.ready();
	};

	componentDidMount() {
		this.terminal.open(this.terminalRef);
		this.ready();
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

export default connect(
	mapState,
	mapDispatch
)(TerminalLocal);

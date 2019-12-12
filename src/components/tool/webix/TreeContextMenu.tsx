import React from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";

import {openDialog} from "../../../actions";
import {DialogType} from "../../../types/dialog";

import "./TreeContextMenu.css";

function mapDispatch(dispatch) {
	return {
		deleteFile: () => dispatch(openDialog(DialogType.DELETE_FILE)),
		renameFile: () => dispatch(openDialog(DialogType.RENAME_FILE))
	};
}

class TreeContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false
		};
		this.props.container.handleContextMenu = this.handleContextMenu.bind(this);
	}

	componentDidMount() {
		document.addEventListener("contextmenu", this.handleOutsideClick);
		document.addEventListener("click", this.handleClick);
	}

	componentWillUnmount() {
		document.removeEventListener("contextmenu", this.handleOutsideClick);
		document.removeEventListener("click", this.handleClick);
	}

	handleOutsideClick = event => {
		if (this.keepOpen) {
			this.keepOpen = false;
		} else {
			this.setState({visible: false});
		}
	};

	handleContextMenu = event => {
		event.preventDefault();

		this.setState({visible: true});
		this.keepOpen = true;

		const clickX = event.clientX;
		const clickY = event.clientY;
		const screenW = window.innerWidth;
		const screenH = window.innerHeight;
		const rootW = this.root.offsetWidth;
		const rootH = this.root.offsetHeight;

		const right = screenW - clickX > rootW;
		const left = !right;
		const top = screenH - clickY > rootH;
		const bottom = !top;

		if (right) {
			this.root.style.left = `${clickX + 5}px`;
		}

		if (left) {
			this.root.style.left = `${clickX - rootW - 5}px`;
		}

		if (top) {
			this.root.style.top = `${clickY + 5}px`;
		}

		if (bottom) {
			this.root.style.top = `${clickY - rootH - 5}px`;
		}
	};

	handleClick = event => {
		const {visible} = this.state;
		const wasOutside = !(event.target.contains === this.root);

		if (wasOutside && visible) this.setState({visible: false});
	};

	render() {
		const {visible} = this.state;
		const {renameFile, deleteFile} = this.props;

		return (
			(visible || null) && (
				<div
					ref={ref => {
						this.root = ref;
					}}
					className="contextMenu"
				>
					<div onClick={deleteFile} className="contextMenu--option">
						Delete
					</div>
					<div onClick={renameFile} className="contextMenu--option">
						Rename
					</div>
				</div>
			)
		);
	}
}

export default connect(
	null,
	mapDispatch
)(TreeContextMenu);

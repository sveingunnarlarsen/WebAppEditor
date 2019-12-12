import React from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";

import {splitEditor} from "../../actions/editor";
import {prettyPrint, calculatePos} from "./utils";
import {findReferences} from "../../completer";
import {SplitDirection} from "../../types/editor";

import "./EditorContextMenu.css";

function mapDispatch(dispatch) {
	return {
		splitEditor: (direction, editorId, fileId) => dispatch(splitEditor(direction, editorId, fileId))
	};
}

class EditorContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false
		};
	}

	componentDidMount() {
		this.clickArea = ReactDOM.findDOMNode(this.props.container);
		this.clickArea.addEventListener("contextmenu", this.handleContextMenu);
		document.addEventListener("contextmenu", this.handleOutsideClick);
		document.addEventListener("click", this.handleClick);
	}

	componentWillUnmount() {
		this.clickArea.removeEventListener("contextmenu", this.handleContextMenu);
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
		calculatePos({x: event.clientX, y: event.clientY}, this.root);
	};

	handleClick = event => {
		const {visible} = this.state;
		const wasOutside = !(event.target.contains === this.root);

		if (wasOutside && visible) this.setState({visible: false});
	};

	findReferences = () => {
		findReferences(this.props.container.ace.current.editor);
	};

	prettyPrint = () => {
		prettyPrint(this.props.container.ace.current.editor);
	};

	splitEditor = (direction, editorId, fileId) => {
		this.props.splitEditor(direction, editorId, fileId);
	};

	render() {
		const {editor, fso} = this.props.container.props;
		const {visible} = this.state;
		
		return (
			(visible || null) && (
				<div
					ref={ref => {
						this.root = ref;
					}}
					className="contextMenu"
				>
					<div onClick={this.findReferences} className="contextMenu--option">
						Find References
					</div>
					<div
						onClick={() => {
							console.log("Clicked undo");
						}}
						className="contextMenu--option"
					>
						Undo
					</div>
					<div className="contextMenu--option">Redo</div>
					<div onClick={this.prettyPrint} className="contextMenu--option">
						Beautify
					</div>
					<div className="contextMenu--option">Toggle Comment</div>
					<div
						onClick={() => {
							this.splitEditor(SplitDirection.VERTICAL, editor.id, fso.id);
						}}
						className="contextMenu--option"
					>
						Split Vertically
					</div>
					<div
						onClick={() => {
							this.splitEditor(SplitDirection.HORIZONTAL, editor.id, fso.id);
						}}
						className="contextMenu--option"
					>
						Split Horizontally
					</div>
					<div className="contextMenu--option">Api Browser</div>
					<div className="contextMenu--option">Npm Browser</div>
				</div>
			)
		);
	}
}

export default connect(
	null,
	mapDispatch
)(EditorContextMenu);

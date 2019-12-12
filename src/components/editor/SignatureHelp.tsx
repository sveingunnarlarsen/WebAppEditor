import React from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";

import {splitEditor} from "../../actions/editor";
import {prettyPrint, calculatePos} from "./utils";
import {findReferences} from "../../completer";
import {SplitDirection} from "../../types/editor";

import "./SignatureHelp.css";

const mapState = state => {
	return {
		showSignatureHelp: state.editor.showSignatureHelp,
		signatureHelpData: state.editor.signatureHelpData
	};
};

class SignatureHelp extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidUpdate() {
		if (this.root) {
			const {rect} = this.props.signatureHelpData;
			const rootRect = this.root.getClientRects()[0];
			calculatePos({x: rect.x - 100, y: rect.y - (20 + rootRect.height)}, this.root);
		}
	}

	getTextPart(part) {
		return part.map(p => p.text);
	}

	getParameters(parameters, separator, argIndex) {
		return parameters.map((p, i, a) => {
			if (argIndex === i) {
				return (
					<span key={i}>
						<b>
							<i>
								{i !== 0 ? this.getTextPart(separator) : ""}
								{this.getTextPart(p.displayParts)}
							</i>
						</b>
					</span>
				);
			}
			return (
				<span key={i}>
					{i !== 0 ? this.getTextPart(separator) : ""}
					{this.getTextPart(p.displayParts)}
				</span>
			);
		});
	}

	getSignatureHelp(result) {
		const {items, argumentIndex} = result;
		return items.map((i, index) => {
			const {prefixDisplayParts, parameters, separatorDisplayParts, suffixDisplayParts} = i;
			return (
				<div key={`signature-item-${index}`} className="signatureHelp--item">
					{this.getTextPart(prefixDisplayParts)}
					{this.getParameters(parameters, separatorDisplayParts, argumentIndex)}
					{this.getTextPart(suffixDisplayParts)}
				</div>
			);
		});
	}

	render() {
		const {signatureHelpData, showSignatureHelp} = this.props;

		if (showSignatureHelp) {
			const {result} = signatureHelpData;
			return (
				<div
					ref={ref => {
						this.root = ref;
					}}
					className="signatureHelp"
				>
					{this.getSignatureHelp(result)}
				</div>
			);
		} else {
			return null;
		}
	}
}

export default connect(
	mapState,
	null
)(SignatureHelp);

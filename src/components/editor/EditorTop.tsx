import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import EditorContainer from "./EditorContainer";

const mapState = (state, ownProps) => {
    const container = state.editor.containers.find(c => c.id === ownProps.containerId);
	return {container};
};

class EditorTop extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {container} = this.props;
		if (container) {
			return <EditorContainer containerId={container.id} />;
		} else {
			return null;
		}
	}
}

export default connect(mapState)(EditorTop);

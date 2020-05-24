import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import EditorContainer from "./EditorContainer";

interface EditorTopProps {
    containerId: string;
}

class EditorTop extends React.Component<EditorTopProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { containerId } = this.props;
        if (containerId) {
            return <EditorContainer containerId={containerId} />;
        } else {
            return null;
        }
    }
}

export default EditorTop;

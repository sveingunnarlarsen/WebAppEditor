import React from "react";
import SplitPane from "react-split-pane";
import { connect } from "react-redux";
import { withStyles, Styles } from "@material-ui/styles";

import { resizeEditor } from "../../actions";
import { EditorContainer as EditorContainerType } from "../../types/editor";
import EditorTop from "./EditorTop";
import EditorTabs from "./EditorTabs";

const styles: Styles<any, any> = {
    editorContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
};

function mapDispatch(dispatch) {
    return {
        resizeEditor: () => dispatch(resizeEditor()),
    };
}
const mapState = (state, ownProps) => {
    const container: EditorContainerType = state.editor.containers.find(c => c.id === ownProps.containerId);
    return { container };
};

interface EditorContainerProps {
    classes: any;
    containerId: string;
    container: EditorContainerType;
    resizeEditor: () => void;
}

class EditorContainer extends React.Component<EditorContainerProps> {
    constructor(props) {
        super(props);
    }

    createEditor(editor) {
        if (editor.isContainer) {
            return <div style={{ width: "100%", height: "100%" }}><EditorTop containerId={editor.id} /></div>;
        } else {
            return <div style={{ width: "100%", height: "100%" }}><EditorTabs editorId={editor.id} /></div>;
        }
    }

    render() {
        const { classes, container } = this.props;
        const { editor1, editor2, split } = container;

        let content;
        if (editor1 && editor2) {
            content = (
                <SplitPane split={split} defaultSize={"50%"} onDragFinished={() => {
                    this.props.resizeEditor();
                }}>
                    {this.createEditor(editor1)}
                    {this.createEditor(editor2)}
                </SplitPane>
            );
        } else {
            content = this.createEditor(editor1);
        }

        return <div className={classes.editorContainer}>{content}</div>;
    }
}

export default connect(mapState, mapDispatch)(withStyles(styles)(EditorContainer));

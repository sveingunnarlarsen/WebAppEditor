import React from "react";
import PropTypes from "prop-types";
import SplitPane from "react-split-pane";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";

import { resizeTool, resizeEditor, resizeTerminal, recalculateEditorWidth } from "../actions";

import ToolContent from "./tool/ToolContent";
import EditorTop from "./editor/EditorTop";
import Preview from "./Preview";
import TerminalContainer from "./terminal/TerminalContainer";

import {getResizerVerticalCss, getResizerHorizontalCss} from "../css/inline";

import "./Content.css";

const styles: any = {
    interactive: {
        pointerEvents: "auto"
    },
    nonInteractive: {
        pointerEvents: "none"
    }
};

const mapState = state => {
    const topContainer = state.editor.containers.find(c => c.isTop);
    return {
        previewVisible: state.previewVisible,
        commandLineVisible: state.commandLineVisible,
        topContainerId: topContainer ? topContainer.id : null
    };
};

function mapDispatch(dispatch) {
    return {
        resizeTool: () => dispatch(resizeTool()),
        resizeEditor: () => dispatch(resizeEditor()),
        resizeTerminal: () => dispatch(resizeTerminal()),
        recalculateEditorWidth: () => dispatch(recalculateEditorWidth()),
    };
}

interface ContentProps extends ReturnType<typeof mapDispatch> {
    classes: any;
    top: any;
    left: any;
    previewVisible: any;
    commandLineVisible: any;
    topContainerId: string | null;
}

interface ContentState {
    isDragging: boolean;
}

class Content extends React.Component<ContentProps, ContentState> {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };
    }

    render() {
        const { classes, top, left, previewVisible, commandLineVisible, topContainerId } = this.props;

        let defaultPreviewSize, defaultContentSize, splitPanePreviewClass, splitPaneContentSize;

        previewVisible ? (defaultPreviewSize = "60%") : ((defaultPreviewSize = "100%"), (splitPanePreviewClass = "soloPane1"));
        commandLineVisible ? (defaultContentSize = "60%") : ((defaultContentSize = "100%"), (splitPaneContentSize = "soloPane1"));

        const useClass = this.state.isDragging ? classes.nonInteractive : classes.interactive;

        return (
            <div style={{ position: "absolute", top, left, width: `calc(100% - ${left})`, height: `calc(100% - ${top})` }}>
                <SplitPane
                    split="vertical"
                    defaultSize={defaultPreviewSize}
                    className={splitPanePreviewClass}
                    resizerStyle={getResizerVerticalCss()}
                    onDragStarted={() => {
                        this.setState({
                            isDragging: true,
                        })
                    }}
                    onDragFinished={() => {
                        console.log("Resize preview ended");
                        this.setState({
                            isDragging: false,
                        })
                        this.props.resizeTool();
                        this.props.resizeEditor();
                        this.props.resizeTerminal();
                    }}
                >
                    <SplitPane
                        split="horizontal"
                        defaultSize={defaultContentSize}
                        className={splitPaneContentSize}
                        resizerStyle={getResizerHorizontalCss()}
                        pane2Style={{ background: "#000000" }}
                        onDragFinished={() => {
                            console.log("Resize command line ended");
                            this.props.resizeTool();
                            this.props.resizeEditor();
                            this.props.resizeTerminal();
                        }}
                    >
                        <SplitPane
                            split="vertical"
                            defaultSize={"15%"}
                            resizerStyle={getResizerVerticalCss()}
                            onDragFinished={() => {
                                console.log("Resize tool ended");
                                this.props.resizeTool();
                                this.props.recalculateEditorWidth();
                            }}
                        >
                            <ToolContent />
                            <EditorTop containerId={topContainerId} />
                        </SplitPane>
                        <TerminalContainer />
                    </SplitPane>
                    <Preview top={top} isVisible={previewVisible} useClass={useClass} />
                </SplitPane>
            </div>
        );
    }
}

export default connect(mapState, mapDispatch)(withStyles(styles)(Content));

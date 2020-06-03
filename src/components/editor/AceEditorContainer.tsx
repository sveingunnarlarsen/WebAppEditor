import React from "react";
import { RefObject } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as _ from "underscore";

import { FileSystemObject } from "../../types";
import { Editor } from "../../types/editor";
import MonacoEditor from "./monaco/MonacoEditor";
import { updateFileState, save } from "../../actions/file";
import { openDialog } from "../../actions";
import { setActiveEditor, splitEditor, resetOpenAt } from "../../actions/editor";
import { DialogType } from "../../types/dialog";
import { SplitDirection } from "../../types/editor";
import { getFileLanguage } from '../../helpers/utils';
import { fileOpened, fileUpdated, formatAllFiles } from "../../completer/index";
import { getModel } from "../../monaco";
import { getFsoDeltaDecorations } from "../../git";

const mapState = (state, ownProps) => {
    let fso = state.app.fileSystemObjects.find(f => f.id === ownProps.fileId);
    return {
        fso,
        editorResized: state.editorResized,
        updateEditors: state.updateEditors,
        openFileAt: state.editor.openFileAt,
    }
};

function mapDispatch(dispatch) {
    return {
        updateFileState: file => dispatch(updateFileState(file)),
        save: () => dispatch(save()),
        setActiveEditor: id => dispatch(setActiveEditor(id)),
        openSearch: () => dispatch(openDialog(DialogType.SEARCH_APP)),
        splitEditor: (direction, editorId, fileId) => dispatch(splitEditor(direction, editorId, fileId)),
        resetOpenAt: () => dispatch(resetOpenAt()),
    };
}

interface EditorProps {
    fso: FileSystemObject;
    viewState: monaco.editor.ICodeEditorViewState | null;
    editorId: string | null;
    openFileAt: any;

    editorResized: number;
    updateEditors: number;

    save: () => void;
    updateFileState: (fso: FileSystemObject) => void;
    splitEditor: (direction: SplitDirection, editorId: string, fileId: string) => void;
    keepEditorState: (editor: monaco.editor.ICodeEditor) => void | null;
    setActiveEditor: (id: string) => void;
    resetOpenAt: () => void;
}

class AceEditorContainer extends React.Component<EditorProps> {

    inputTimeout: number;
    deltaDecorations: string[] = [];
    editor: monaco.editor.IStandaloneCodeEditor;

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.fso.id !== nextProps.fso.id) {
            if (this.props.keepEditorState) {
                this.props.keepEditorState(this.editor);
            }
            return true;
        }
        if (this.props.updateEditors !== nextProps.updateEditors) {
            return true;
        }
        if (this.props.editorResized !== nextProps.editorResized) {
            this.editor.layout();
        }
        if (nextProps.openFileAt) {
            this.editor.revealRangeInCenter(nextProps.openFileAt);
            this.editor.setSelection(nextProps.openFileAt);
            this.props.resetOpenAt();
        }
        return false;
    }

    componentDidUpdate() {
        if (this.editor) {
            this.setupEditor();
            _.defer(() => this.editor.focus());
        }
    }

    addDeltaDecorations = _.debounce(async () => {
        const decorations = await getFsoDeltaDecorations(this.props.fso.path, this.editor.getValue());
        this.deltaDecorations = this.editor.deltaDecorations(this.deltaDecorations, decorations);
    }, 100);

    addActionsAndCommands = (editor: monaco.editor.IStandaloneCodeEditor) => {

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            this.props.updateFileState({ ...this.props.fso, content: this.editor.getValue(), modified: true });
            this.props.save();
        });

        editor.addAction({
            id: "format_project",
            label: "Format Project",
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: "1_modification",
            contextMenuOrder: 3,
            run: () => {
                formatAllFiles();
            }
        })

        if (this.props.editorId) {
            editor.addAction({
                id: "split_vertically",
                label: "Split Vertically",
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: '2_splitting',
                contextMenuOrder: 1,
                run: (editor) => {
                    this.props.splitEditor(SplitDirection.VERTICAL, this.props.editorId, this.props.fso.id)
                }
            });
            editor.addAction({
                id: "split_horizontally",
                label: "Split Horizontally",
                precondition: null,
                keybindingContext: null,
                contextMenuGroupId: '2_splitting',
                contextMenuOrder: 2,
                run: (editor) => {
                    this.props.splitEditor(SplitDirection.HORIZONTAL, this.props.editorId, this.props.fso.id)
                }
            });

            editor.onDidFocusEditorWidget(() => {
                console.log("Editor focused");
                this.props.setActiveEditor(this.props.editorId);
            });
        }
    }

    setupEditor = () => {
        fileOpened(this.props.fso.path);
        this.addDeltaDecorations();
        _.defer(() => this.editor.layout());
    }

    handleEditorDidMount = (getValue, editor) => {
        this.editor = editor;
        this.addActionsAndCommands(this.editor);
        this.editor.onDidChangeModelContent(() => {
            this.addDeltaDecorations();
        })
        this.setupEditor();
    };

    render() {
        const { fso, viewState } = this.props;

        const model = getModel(this.props.fso.path);

        if (!model) {
            console.log("No model could be found for path: ", this.props.fso.path);
            return;
        }

        if (fso.content) {
            model.setValue(fso.content);
        }

        return (
            <React.Fragment>
                <MonacoEditor height="100%" model={model} openFileAt={this.props.openFileAt} viewState={viewState} theme="dark" editorDidMount={this.handleEditorDidMount} />
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(AceEditorContainer);

import React from "react";
import { RefObject } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as _ from "underscore";

import MonacoEditor from "./monaco/MonacoEditor";
import { FileSystemObject, AppEditorState } from "../../types";
import { Editor, SplitDirection } from "../../types/editor";
import { DialogType } from "../../types/dialog";
import { openDialog } from "../../actions";
import { updateFileState, save } from "../../actions/file";
import { setActiveEditor, splitEditor, resetOpenAt, resetSetSearch } from "../../actions/editor";
import { getFileLanguage } from '../../helpers/utils';
import { fileOpened, fileUpdated, formatAllFiles } from "../../completer/index";
import { getModel } from "../../monaco";
import { getFsoDeltaDecorations } from "../../git";

const mapState = (state: AppEditorState, ownProps) => {
    let fso = state.app.fileSystemObjects.find(f => f.id === ownProps.fileId);
    return {
        fso,
        isDark: state.darkState,
        lock: state.app.lock,
        editorResized: state.editorResized,
        updateEditors: state.updateEditors,
        openFileAt: state.editor.openFileAt,
        setSearch: state.editor.setSearch,
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
        resetSetSearch: () => dispatch(resetSetSearch()),
    };
}

interface EditorProps extends ReturnType<typeof mapDispatch>, ReturnType<typeof mapState> {
    viewState: monaco.editor.ICodeEditorViewState | null;
    editorId: string | null;
    isSearch: boolean;
    showLineNumber: number;

    keepEditorState: (editor: monaco.editor.ICodeEditor) => void | null;
}

class AceEditorContainer extends React.Component<EditorProps> {

    inputTimeout: number;
    deltaDecorations: string[] = [];
    editor: monaco.editor.IStandaloneCodeEditor;
    dontFocus: boolean = false;

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps: EditorProps, nextState) {
        if (this.props.isDark !== nextProps.isDark) {
            console.log("Component should update because theme has changed");
            return true;
        }
        if (this.props.fso.id !== nextProps.fso.id) {
            if (this.props.keepEditorState) {
                this.props.keepEditorState(this.editor);
            }
            console.log("Component should update because fso.id is different");
            return true;
        }
        if (this.props.updateEditors !== nextProps.updateEditors) {
            this.dontFocus = true;
            console.log("Component should update because updateEditors is true");
            return true;
        }
        if (this.props.isSearch && this.props.showLineNumber !== nextProps.showLineNumber) {
            console.log("Component should update because isSearch is true and line numbers are different");
            return true;
        }
        if (this.props.lock !== nextProps.lock) {
            console.log("Component should update because lock differ");
            return true;
        }
        if (this.props.editorResized !== nextProps.editorResized) {
            console.log("Calling editor layout");
            console.log(this.props.editorResized);
            console.log(nextProps.editorResized);
            this.editor.layout();
        }
        if (nextProps.openFileAt) {
            console.log("Open file at");
            this.editor.revealRangeInCenter(nextProps.openFileAt);
            this.editor.setSelection(nextProps.openFileAt);
            this.props.resetOpenAt();
        }
        if (nextProps.setSearch) {
            console.log("Setting editor search");
            const searchString = nextProps.setSearch;
            this.editor.getAction('actions.find').run();
            const findController = this.editor.getContribution("editor.contrib.findController");
            _.defer(() => {
                // @ts-ignore
                findController.setSearchString(searchString);
                this.props.resetSetSearch();
            });
        }
        return false;
    }

    componentDidUpdate() {
        this.setupEditor();
    }

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
        });

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

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_F, () => {
                this.props.openSearch();
            });

            editor.onDidFocusEditorWidget(() => {
                this.props.setActiveEditor(this.props.editorId);
            });
        }
    }

    addDeltaDecorations = _.debounce(async () => {
        const decorations = await getFsoDeltaDecorations(this.props.fso.path, this.editor.getValue());
        this.deltaDecorations = this.editor.deltaDecorations(this.deltaDecorations, decorations);
    }, 500);

    setupEditor = () => {
        fileOpened(this.props.fso.path);
        this.addDeltaDecorations();
        _.defer(() => this.editor.layout());

        if (this.props.editorId && !this.dontFocus) {
            _.defer(() => this.editor.focus());
        } else if (this.props.isSearch) {
            const lineNumber = this.props.showLineNumber;
            _.defer(() => {
                this.editor.revealLineInCenter(lineNumber);
                this.editor.setSelection({ startLineNumber: lineNumber, endLineNumber: lineNumber, startColumn: 1, endColumn: 9999 })
            });
        }
        this.dontFocus = false;
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
        const { fso, viewState, openFileAt, lock, isDark } = this.props;

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
                <MonacoEditor height="100%" model={model} openFileAt={openFileAt} viewState={viewState} theme={isDark ? "dark" : "light"} editorDidMount={this.handleEditorDidMount} options={{ readOnly: !lock }} />
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(AceEditorContainer);

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import store from "../../../store";
import MonacoContainer from './MonacoContainer';
import { monaco } from "../../../monaco";
import { getFileByPath } from "../../../store/utils";
import { showFile, resetOpenAt } from "../../../actions/editor";
import { themeDark, setTokensProvider } from "../../../monaco/textmate";

const noop = _ => { };
const useMount = effect => useEffect(effect, []);
const useUpdate = (effect, deps, applyChanges = true) => {
    const isInitialMount = useRef(true);

    useEffect(
        isInitialMount.current || !applyChanges
            ? _ => { isInitialMount.current = false }
            : effect,
        deps
    );
}

const Editor =
    ({ model, viewState, openFileAt, editorDidMount, theme, line, width, height, loading, options, _isControlledMode }) => {
        const [isEditorReady, setIsEditorReady] = useState(false);
        const [isMonacoMounting, setIsMonacoMounting] = useState(true);
        const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
        const monacoRef = useRef<typeof monaco>();
        const containerRef = useRef();

        useMount(_ => {
            monacoRef.current = monaco;
            setIsMonacoMounting(false);

            return _ => editorRef.current ? disposeEditor() : null;
        });

        useUpdate(_ => {
            editorRef.current.setModel(model);
            if (viewState) {
                editorRef.current.restoreViewState(viewState);
            }
            if (openFileAt) {
                console.log("Opening file at: ", openFileAt);
                editorRef.current.revealRangeInCenter(openFileAt);
                editorRef.current.setSelection(openFileAt);
                store.dispatch(resetOpenAt());
            }
        }, [model, viewState, openFileAt], isEditorReady);

        useUpdate(_ => {
            editorRef.current.setScrollPosition({ scrollTop: line });
        }, [line], isEditorReady);

        useUpdate(_ => {
            monacoRef.current.editor.setTheme(theme);
        }, [theme], isEditorReady);

        useUpdate(_ => {
            editorRef.current.updateOptions(options);
        }, [options], isEditorReady);

        const createEditor = useCallback(async _ => {

            editorRef.current = monacoRef.current.editor.create(containerRef.current, {
                model,
                ...options,
            });

            // const {registry, grammars} = getRegistryAndGrammars();
            setTokensProvider(editorRef.current, model);
            //await wireTmGrammars(monaco, registry, grammars, editorRef.current);

            // @ts-ignore
            editorRef.current._codeEditorService.openCodeEditor = ({ resource, options }) => {
                const file = getFileByPath(resource.path);
                const range = options.selection;
                store.dispatch(showFile(file.id, null, range));
            }

            window.editorRef = editorRef.current;

            editorDidMount(editorRef.current.getValue.bind(editorRef.current), editorRef.current);

            monacoRef.current.editor.defineTheme('dark', themeDark);
            monacoRef.current.editor.setTheme(theme);

            if (openFileAt) {
                editorRef.current.revealRangeInCenter(openFileAt);
                editorRef.current.setSelection(openFileAt);
                store.dispatch(resetOpenAt());
            }
            setIsEditorReady(true);
        }, [editorDidMount, model, openFileAt, options, theme]);

        useEffect(_ => {
            !isMonacoMounting && !isEditorReady && createEditor();
        }, [isMonacoMounting, isEditorReady, createEditor]);

        const disposeEditor = () => editorRef.current.dispose();

        return <MonacoContainer
            width={width}
            height={height}
            isEditorReady={isEditorReady}
            loading={loading}
            _ref={containerRef}
        />;
    };

Editor.propTypes = {
    model: PropTypes.any,
    viewState: PropTypes.any,
    editorDidMount: PropTypes.func,
    theme: PropTypes.string,
    line: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    loading: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    options: PropTypes.object,
    openFileAt: PropTypes.object,
    _isControlledMode: PropTypes.bool,
};

Editor.defaultProps = {
    editorDidMount: noop,
    theme: 'light',
    width: '100%',
    height: '100%',
    loading: 'Loading...',
    options: {},
    _isControlledMode: false,
};

export default Editor;
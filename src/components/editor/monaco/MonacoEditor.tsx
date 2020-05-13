import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

import MonacoContainer from './MonacoContainer';

import {monaco} from "@monaco-editor/react";

const noop = _ => {};
const useMount = effect => useEffect(effect, []);
const useUpdate = (effect, deps, applyChanges = true) => {
  const isInitialMount = useRef(true);

  useEffect(
    isInitialMount.current || !applyChanges
      ? _ => { isInitialMount.current = false }
      : effect,
    deps
  );
};

const themes = {
  'night-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#202124',
    },
  },
};

const Editor =
  ({ model, viewState, editorDidMount, theme, line, width, height, loading, options, _isControlledMode }) =>
{
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isMonacoMounting, setIsMonacoMounting] = useState(true);
  const editorRef = useRef();
  const monacoRef = useRef();
  const containerRef = useRef();

  useMount(_ => {
    const cancelable = monaco.init();

    cancelable
      .then(monaco => ((monacoRef.current = monaco) && setIsMonacoMounting(false)))
      .catch(error => console.error('An error occurred during initialization of Monaco:', error));

    return _ => editorRef.current ? disposeEditor() : cancelable.cancel();
  });

  useUpdate(_ => {
    /*
    if (options.readOnly) {
      editorRef.current.setValue(value);
    } else {
      editorRef.current.executeEdits('', [{
        range: editorRef.current.getModel().getFullModelRange(),
        text: value,
      }]);

      if (_isControlledMode) {
        const model = editorRef.current.getModel();

        model.forceTokenization(model.getLineCount());
      }

      editorRef.current.pushUndoStop();
    }
    */
  }, [viewState], isEditorReady);

  useUpdate(_ => {
    editorRef.current.setModel(model);
    if (viewState) {
      editorRef.current.restoreViewState(viewState);
    }   
    // set last value by .setValue method before changing the language
    // editorRef.current.setValue(value);
    // monacoRef.current.editor.setModelLanguage(editorRef.current.getModel(), language);
  }, [model, viewState], isEditorReady);

  useUpdate(_ => {
    editorRef.current.setScrollPosition({ scrollTop: line });
  }, [line], isEditorReady);

  useUpdate(_ => {
    monacoRef.current.editor.setTheme(theme);
  }, [theme], isEditorReady);

  useUpdate(_ => {
    editorRef.current.updateOptions(options);
  }, [options], isEditorReady);

  const createEditor = useCallback(_ => {
    editorRef.current = monacoRef.current.editor.create(containerRef.current, {
      //value,
      //language,
      model,
      automaticLayout: true,
      ...options,
    });

    editorDidMount(editorRef.current.getValue.bind(editorRef.current), editorRef.current);

    monacoRef.current.editor.defineTheme('dark', themes['night-dark']);
    monacoRef.current.editor.setTheme(theme);

    setIsEditorReady(true);
  }, [editorDidMount, model, options, theme]);

  useEffect(_ => {
    !isMonacoMounting && !isEditorReady && createEditor();
  }, [isMonacoMounting, isEditorReady, createEditor]);

  const disposeEditor = _ => editorRef.current.dispose();

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
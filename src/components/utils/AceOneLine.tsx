import React from "react";
import ReactDOM from "react-dom";
import Editor from "@monaco-editor/react";

class AceOneLine extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {classes, value, path} = this.props;
		const mode = modelist.getModeForPath(path);
	    
		return (
			<React.Fragment>
			    <Editor height="100%" language="javascript" theme="dark" value={fso.content} editorDidMount={this.handleEditorDidMount} />
			</React.Fragment>
		);
	}
}

export default AceOneLine;

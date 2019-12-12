import React from "react";
import ReactDOM from "react-dom";

import {connect} from "react-redux";
import AceEditor from "react-ace-builds";

const modelist = ace.require("ace/ext/modelist");

class AceOneLine extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {classes, value, path} = this.props;
		const mode = modelist.getModeForPath(path);
	    
	    console.log(mode);
	    
		return (
			<React.Fragment>
				<AceEditor 
				    value={value}
				    theme="tomorrow_night"
				    maxLines={1} 
				    autoScrollEditorIntoView={true} 
				    highlightActiveLine={false}
				    printMargin={false}
				    showGutter={false}
				    mode={mode.name}
			    />
			</React.Fragment>
		);
	}
}

export default AceOneLine;

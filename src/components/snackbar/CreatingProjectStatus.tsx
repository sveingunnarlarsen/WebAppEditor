import React from "react";
import {withStyles} from "@material-ui/styles";
import {connect} from "react-redux";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";

import {AppEditorState} from "../../types"

const mapState = (state: AppEditorState)  => {
	return {
		isCreating: state.isCreating
	};
};

interface CreatingProjectStatusProps {
    isCreating: boolean;
}

class CreatingProjectStatus extends React.Component<CreatingProjectStatusProps> {
	constructor(props) {
		super(props);
	}

	render() {
		const {isCreating} = this.props;
		return (
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right"
				}}
				open={isCreating}
				message={<span>Creating Project</span>}
				action={[<CircularProgress key="1" />]}
			/>
		);
	}
}

export default connect(mapState)(CreatingProjectStatus);

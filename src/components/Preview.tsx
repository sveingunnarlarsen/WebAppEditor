import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/styles";

const styles = {};

const mapState = state => {
	return {
		id: state.app.id
	};
};

class Preview extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {id, isVisible, useClass} = this.props;

		if (!isVisible) {
			return <div />;
		} else {
			const link = `/api/webapp/${id}/preview`;

			return (
				<div className={useClass} style={{width: "100%", height: "100%"}}>
					<iframe src={link} id="iframeRun" height="100%" width="100%" align="center" />;
				</div>
			);
		}
	}
}

Preview.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(mapState)(withStyles(styles)(Preview));

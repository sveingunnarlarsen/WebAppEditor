import React from "react";
import {withStyles} from "@material-ui/styles";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import {fetchWebApp} from "../../actions/app";

const styles = {
	tableRow: {
		cursor: "pointer"
	}
};

const columns = [{id: "name", label: "Name"}, {id: "description", label: "Description"}, {id: "type", label: "Type"}, {id: "updatedAt", label: "Changed On"}, {id: "changedBy", label: "Changed By"}];

const mapState = state => {
	return {apps: state.apps.list};
};

function mapDispatch(dispatch) {
	return {
		rowClick: id => dispatch(fetchWebApp(id))
	};
}

class Projects extends React.Component {
	constructor(props) {
		super(props);
	}

	handleRowClick = id => {
		this.props.close();
		this.props.rowClick(id);
	};

	render() {
		const {classes, apps, close} = this.props;
		return (
			<React.Fragment>
				<DialogTitle>New File</DialogTitle>
				<DialogContent>
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								{columns.map(column => (
									<TableCell key={column.id} align={column.align}>
										{column.label}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{apps.map(row => {
								return (
									<TableRow className={classes.tableRow} hover tabIndex={-1} key={row.id} onClick={() => this.handleRowClick(row.id)}>
										{columns.map(column => {
											const value = row[column.id];
											return <TableCell key={column.id}>{value}</TableCell>;
										})}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</DialogContent>
				<DialogActions>
					<Button onClick={close}>Close</Button>
				</DialogActions>
			</React.Fragment>
		);
	}
}

Projects.propTypes = {
	classes: PropTypes.object.isRequired
};

export default connect(
	mapState,
	mapDispatch
)(withStyles(styles)(Projects));

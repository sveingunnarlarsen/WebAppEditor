import React from "react";
import { connect } from "react-redux";
import * as _ from "underscore";

import { withStyles } from "@material-ui/styles";
import {
    Paper,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    TablePagination,
} from "@material-ui/core";


import { getProject } from "../../actions/app";
import { formatDate } from "../../helpers/utils";

const styles = {
    container: {
        maxHeight: "50vh",
        minHeight: "50vh",
    },
    tableRow: {
        cursor: "pointer"
    }
};

const columns = [
    { id: "name", label: "Name" }, 
    { id: "description", label: "Description" }, 
    { id: "type", label: "Type" }, 
    { id: "updatedAt", label: "Changed On", format: formatDate }, 
    { id: "changedBy", label: "Changed By" }];

const mapState = state => {
    return { apps: state.apps.list };
};

function mapDispatch(dispatch) {
    return {
        rowClick: id => dispatch(getProject(id))
    };
}

interface ProjectsProps extends ReturnType<typeof mapState>, ReturnType<typeof mapDispatch> {
    classes: any;
    close: () => void;
}

class Projects extends React.Component<ProjectsProps, {value: string, page: number, rowsPerPage: number, searchResult: []}> {
    inputRef: HTMLElement;
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            page: 0,
            rowsPerPage: 25,
            searchResult: [],
        };
    }

    handleRowClick = id => {
        this.props.close();
        this.props.rowClick(id);
    };    

    updateSearchResult = _.debounce(async (value) => {
        const apps = this.props.apps;
        
        const searchResult = await apps.reduce(async (accP, app) => {            
            const acc = await accP;

            let match = false;
            const keys = Object.keys(app).filter(key => ['changedBy', 'type', 'description', 'name'].includes(key));

            for (let i = 0; i < keys.length; i++) {

                const key = keys[i];
                const keyValue = app[key];

                if (keyValue && keyValue.match(new RegExp(value, 'gi'))) {                    
                    match = true;
                    continue;
                }
            }

            if (match) {
                acc.push(app);
            }            
            await new Promise(resolve => _.defer(resolve));
            return acc;
        }, Promise.resolve([]));
        
        this.setState({
            searchResult,
        });        
    }, 100);

    updateValue = e => {
        this.setState({
            value: e.target.value
        });        
        if (e.target.value) {
            this.updateSearchResult(e.target.value);
        } else {
            this.setState({
                searchResult: [],
            })
        }
    };

    handleChangePage = (e, newPage) => {
        this.setState({
            page: newPage
        });        
    };

    handleChangeRowsPerPage = e => {
        this.setState({
            rowsPerPage: +e.target.value,
            page: 0
        });
    };

    handleTextFieldKeyDown = e => { };

    render() {
        const { classes, apps, close } = this.props;
        const { value, page, rowsPerPage, searchResult } = this.state;

        let visibleApps;
        if (value) {
            visibleApps = searchResult;
        } else {
            visibleApps = apps;
        }
                
        return (
            <React.Fragment>
                <DialogTitle>Projects</DialogTitle>
                <DialogContent>
                    <TextField
                        ref={ref => {
                            this.inputRef = ref;
                        }}
                        autoFocus={true}
                        value={value}
                        onChange={this.updateValue}
                        label="Search"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true
                        }}
                        onKeyDown={this.handleTextFieldKeyDown}
                    />
                    <TableContainer className={classes.container}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map(column => (
                                        <TableCell key={column.id}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleApps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                                    return (
                                        <TableRow className={classes.tableRow} hover tabIndex={-1} key={row.id} onClick={() => this.handleRowClick(row.id)}>
                                            {columns.map(column => {
                                                const value = row[column.id];
                                                return <TableCell key={column.id}>{column.format ? column.format(value) : value}</TableCell>;
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={visibleApps.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Close</Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}

export default connect(
    mapState,
    mapDispatch
)(withStyles(styles)(Projects));

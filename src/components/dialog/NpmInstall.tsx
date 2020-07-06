import React from "react";
import { connect } from "react-redux";
import * as _ from "underscore";
import { throwError, handleAjaxError } from "../../actions/error";
import { getFileByPath } from "../../store/utils";
import { installNpmModule } from "../../actions/npm";
import { formatDate, generateGravatarLink } from "../../helpers/utils";

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
    Typography,
    Avatar,
    Chip
} from "@material-ui/core";

interface SingleResult {
    package: {
        name: string;
        scope: string;
        version: string;
        description: string;
        keywords: string[];
        date: string;
        links: {
            npm: string;
            homepage: string;
            repository: string;
            bugs: string;
        }
        publisher: {
            username: string;
            email: string;
        }
    };
    score: {
        final: number;
        detail: {
            quality: number;
            popularity: number;
            maintenance: number;
        }
    }
    searchScore: number;
    flags: any;
}

interface SearchResult {
    total: number;
    results: SingleResult[];
}

const styles = {
    container: {
        maxHeight: "50vh",
        minHeight: "50vh",
    },
    tableRow: {
        
    }
};

function mapDispatch(dispatch) {
    return {
        installNpmModule: (name, version) => dispatch(installNpmModule({ name, version })),
    };
}

interface NpmInstallProps extends ReturnType<typeof mapDispatch> {
    classes: any;
    close: () => void;
}

interface NpmInstallState {
    value: string;
    searchResult: SearchResult;
    page: number;
    rowsPerPage: number,
}

class NpmInstall extends React.Component<NpmInstallProps, NpmInstallState> {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            searchResult: { total: 0, results: [] },
            page: 0,
            rowsPerPage: 25,
        };
    }

    searchNpm = (value: string) => {
        fetch(`https://api.npms.io/v2/search?q=${value}&size=250`)
            .then(throwError)
            .then(response => response.json())
            .then(searchResult => this.setState({ searchResult }))
            .catch(error => handleAjaxError(error));
    }

    updateValue = e => {
        this.setState({
            value: e.target.value
        });
    };

    handleRowClick = (row: SingleResult) => {
        this.props.installNpmModule(row.package.name, row.package.version);
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

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.value) {
            this.searchNpm(this.state.value);
        } else {
            this.setState({
                searchResult: { total: 0, results: [] }
            });
        }
    };

    render() {
        const { close, classes } = this.props;
        const { value, searchResult, page, rowsPerPage } = this.state;

        const packages = searchResult.results;

        return (
            <React.Fragment>
                <DialogTitle>Install npm module</DialogTitle>
                <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            autoFocus={true}
                            value={value}
                            onChange={this.updateValue}
                            label="Search npm registry"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true
                            }}
                        />

                    </form>
                    <TableContainer className={classes.container}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableBody>
                                {packages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                                    return (
                                        <TableRow key={row.package.name} className={classes.tableRow} hover tabIndex={-1}>
                                            <TableCell>
                                                <div style={{display: "flex"}}>
                                                    <div style={{width: "80%"}}>
                                                        <Typography>{row.package.name}</Typography>
                                                        <Typography>{row.package.description}</Typography>
                                                        {row.package.keywords?.map(key => {
                                                            return (
                                                                <Chip label={key} />
                                                            )
                                                        })}
                                                        <Typography>{row.package.version}</Typography>
                                                        <a href={row.package.links?.homepage} target={"_blank"}>{row.package.links?.homepage}</a>
                                                        <Typography>Published: {formatDate(row.package.date)}</Typography>
                                                    </div>
                                                    <div style={{position: "relative", width: "100%"}}>
                                                        <Avatar src={generateGravatarLink(row.package.publisher?.email)} style={{position: "absolute", top: 0, right: 0}}></Avatar>
                                                        <Button color={"primary"} style={{position: "absolute", bottom: 0, right: 0}} onClick={() => this.handleRowClick(row)}>Install</Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        color="transparent"
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={packages.length}
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
    null,
    mapDispatch
)(withStyles(styles)(NpmInstall));
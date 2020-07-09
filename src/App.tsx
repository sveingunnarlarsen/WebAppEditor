import React from "react";
import { connect } from "react-redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import TopMenu from "./components/menu/TopMenu";
import SideMenu from "./components/menu/SideMenu";
import Content from "./components/Content";
import DialogContainer from "./components/dialog/DialogContainer";
import SnackbarContainer from "./components/snackbar/SnackbarContainer";

import store from "./store";
import { getMasterData } from "./actions/app";
import { getApis } from "./actions/resources";
import { initTextMate } from "./monaco/textmate";
import { AppEditorState } from "./types"

import "./App.css";

initTextMate();
store.dispatch(getMasterData());
store.dispatch(getApis());

const mapState = (state: AppEditorState) => {
    return {
        darkState: state.darkState,
    };
};


class App extends React.Component<ReturnType<typeof mapState>> {
    constructor(props) {
        super(props);
    }

    render() {
        const menuWidth = "3.5rem";
        const isDark = this.props.darkState;

        const muiTheme = createMuiTheme({
            palette: isDark ? {
                type: "dark",
                background: {
                    default: "#252526"
                },
                primary: {
                    main: "#F59825",
                    contrastText: "#fff"
                },
            } : {
                type: "light"
            },
            overrides: isDark ? {
                MuiToolbar: {
                    root: {
                        backgroundColor: "#333333",
                    }
                },
                MuiDrawer: {
                    paper: {
                        backgroundColor: "#333333",
                    }
                },
                MuiTablePagination: {
                    toolbar: {
                        backgroundColor: "transparent",
                    }
                }
            } : {},
        });

        return (
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <TopMenu height={menuWidth} />
                <SideMenu width={menuWidth} />
                <Content top={menuWidth} left={menuWidth} />
                <DialogContainer />
                <SnackbarContainer />
            </MuiThemeProvider>
        );
    }
}

export default connect(mapState)(App);
import "babel-polyfill";
import React from "react";

import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import TopMenu from "./components/menu/TopMenu";
import SideMenu from "./components/menu/SideMenu";
import Content from "./components/Content";
import DialogContainer from "./components/dialog/DialogContainer";
import SnackbarContainer from "./components/snackbar/SnackbarContainer";

import "./terminal";
import "./completer";
import "./git";
import "./App.css"; //TODO: Clean up css

const menuWidth = "3.5rem";

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const muiTheme = createMuiTheme({
			palette: {
				type: "dark"
			}
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

export default App;

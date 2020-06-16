(Release - 25.06)

Gunnar:
* Locking project(DONE).
* Show user info. Show connection status, network and socket.
* Complete import zip.
* TEST PKG.
* Drag and drop files/folders in the ui tree.
* Verify deployment of runtime assets.

Jørgen:
* Update basic template
* Partial file update
* Test apps created on old build vs new build. Map differences
* getSignatureHelp server lag. Maybe related to .tsx and/or material-ui
* TEST PKG

Both:
* Dialog with documentation. E.g. Ctrl-S = Save, Supported git commands. (SPECIFY THAT DEVELOPMENT DOES NOT WORK IN HIGH AVAILABILITY ENV)
* Change icon for compilation details and improve ui
* Think about compile/run preview design
* TEST PKG

(After release)

Backlog:
* Incremental webpack builds/live hot reloads.
* Customizable keybindings.
* Include server scripts in editor. (BIG TASK).
* Include api definitions (As module?).
   - import {myApi} from "planet9-apis";
   - const result = await myApi.operation();
* Protected or Anonymous access to app.
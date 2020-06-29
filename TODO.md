(Release - 25.06)

Gunnar:
* Verify deployment of runtime assets.
* Include api definitions.
 - Create api dependency tool section in explorer
 - Dialog to add apis to project
 - Many to Many relation between webapp and apis.
 - Refresh on change   
* Locking project(DONE).
* Drag and drop files/folders in the ui tree(DONE).
* Show user info. Show connection status, network and socket, logout button(DONE).
* Complete import zip(DONE).
* TEST PKG(DONE).


Jørgen:
* Include api definitions.
 - Build module with apis included in project on refresh.
 - Add module to language server.
* Update basic template(DONE)
* Test apps created on old build vs new build. Map differences(DONE)
* getSignatureHelp server lag. Maybe related to .tsx and/or material-ui(DONE)
* TEST PKG(DONE)
* Partial file update(Backend implemented, frontend remaining)

Both:
* Dialog with documentation. E.g. Ctrl-S = Save, Supported git commands. (SPECIFY THAT DEVELOPMENT DOES NOT WORK IN HIGH AVAILABILITY ENV)
* Change icon for compilation details and improve ui(DONE)
* Think about compile/run preview design
* TEST PKG

(After release)

Backlog:
* Incremental webpack builds/live hot reloads.
   * Create build-forks to prevent P9 processes becomming overloaded
* Customizable keybindings.
   - VSCode does this very well https://code.visualstudio.com/docs/getstarted/keybindings
* Include server scripts in editor. (BIG TASK).
* Protected or Anonymous access to app.
   * Login
* ProjectMenu show last 5 projects, changes.
* Open file when creating file.
* Show removed diff in popover with mark in margin.
* Where is git repository relative to origin.
* dummy
* Use MonacoDiffEditor to display diffs, for eksample, show all file diffs when running "git difftool"
* Show compiled apps in http://localhost:8080/cockpit.html#run-application
* Add disable option for production (disables users from accessing the production URL)
* Fix naming convention, App Editor / Pro Code Editor. dont care...
  Just make it consistent across planet9. including the documentation

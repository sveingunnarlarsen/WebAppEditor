(Release - 25.06)

Gunnar:
* Verify deployment of runtime assets.
* Install single npm module from pluss button in npm view and write to package.json
* Where is git repository relative to origin.
* Show compiled apps in http://localhost:8080/cockpit.html#run-application (Add toggle openui5/webapp)
* Add disable option for production (disables users from accessing the production URL)
* Include api definitions.
 - Create api dependency tool section in explorer
 - Dialog to add apis to project
 - Many to Many relation between webapp and apis.
 - Refresh on change   

Jørgen:
* language port must be configurable
* Project name write to package.json
 - Rename also
* Auto compile new project from template
* Include api definitions.
 - Build module with apis included in project on refresh.
 - Add module to language server.

Both:
* Dialog with documentation. E.g. Ctrl-S = Save, Supported git commands. (SPECIFY THAT DEVELOPMENT DOES NOT WORK IN HIGH AVAILABILITY ENV)

(After release)

Backlog:
* Include server scripts in editor. (BIG TASK).
* Protected or Anonymous access to app.
   * Login
* App editor landing page. Create/Open
* Sort by header in projects list
* Partial file update(Backend implemented, frontend remaining)
* Think about compile/run preview design
* Incremental webpack builds/live hot reloads.
   * Create build-forks to prevent P9 processes becomming overloaded
* Customizable keybindings.
   - VSCode does this very well https://code.visualstudio.com/docs/getstarted/keybindings
* ProjectMenu show last 5 projects, changes.
* Open file when creating file.
* Show removed diff in popover with mark in margin.
* Use MonacoDiffEditor to display diffs, for eksample, show all file diffs when running "git difftool"
* Calculate diagnostics for entire project
* Don't process providers for big files X > ?. 
* Server worker for apps in launchpad.

DONE:
* Locking project(DONE).
* Drag and drop files/folders in the ui tree(DONE).
* Show user info. Show connection status, network and socket, logout button(DONE).
* Complete import zip(DONE).
* TEST PKG(DONE).
* Change icon for compilation details and improve ui(DONE)
* Update basic template(DONE)
* Test apps created on old build vs new build. Map differences(DONE)
* getSignatureHelp server lag. Maybe related to .tsx and/or material-ui(DONE)
import * as http from "isomorphic-git/http/web";
import * as git from "isomorphic-git";
import FS from "@isomorphic-git/lightning-fs";

import * as JsDiff from "diff";
import * as chalk from "chalk";
import yargs from "yargs-parser";

import store from "../store";
import { getFileById } from "../store/utils";
import { FileSystemObject } from "../types";
import { startGitCloneClone, endGitClone } from "../actions";
import { createFsos, save, deleteFsos } from "../actions/file";
import { getFileContent, writeFileContent, fsExists } from "./utils";

const fs = new FS("fs");
const pfs = fs.promises;

// @ts-ignore
const forcedChalk = new chalk.constructor({ enabled: true, level: 2 });

class GitEmitter extends EventTarget {
    isInitializing: boolean;

    start() {
        this.isInitializing = true;
        this.dispatchEvent(new Event("initStart"));
    }

    end() {
        this.isInitializing = false;
        this.dispatchEvent(new Event("initEnd"));
    }
}

const gitEmitter = new GitEmitter();
// TODO: Should use planet 9 proxy.
const corsProxy = "https://cors.isomorphic-git.org";

let currentAppName: string;
let currentGitDir: string;
let configUser = {};

export function getConfigUser() {
    return configUser;
}

export async function setConfigUser(prop, value) {
    configUser[prop] = value;
    await git.setConfig({ fs, dir: currentGitDir, path: "user." + prop, value });
}

export async function setRemoteOrigin(value) {
    await git.addRemote({ fs, dir: currentGitDir, remote: "origin", url: value, force: true });
}

async function handleChange() {
    //Switch to new project.
    if (store.getState().app.name && store.getState().app.name != currentAppName) {
        gitEmitter.start();
        currentAppName = store.getState().app.name;
        currentGitDir = `/${currentAppName}`;

        try {
            console.log("Initializing git: ", currentGitDir);
            await pfs.readdir(`${currentGitDir}/.git`);
            await syncAppFilesWithGit();
        } catch (e) {
            if (e.message.indexOf("ENOENT") > -1) {
                console.log("Git dir does not exist");
                pfs.mkdir(currentGitDir);
                await git.init({ fs, dir: currentGitDir });
                await syncAppFilesWithGit();
                console.log("Git initialized");
            } else {
                console.log("Failed to initialize git", e.message);
            }
        }
        configUser = {
            name: await git.getConfig({ fs, dir: currentGitDir, path: "user.name" }),
            email: await git.getConfig({ fs, dir: currentGitDir, path: "user.email" }),
            token: await git.getConfig({ fs, dir: currentGitDir, path: "user.token" })
        };
        gitEmitter.end();
    } else if (!store.getState().app.name) {
        currentAppName = "";
        currentGitDir = "";
    }
}

console.log("Store: ", store);
store.subscribe(handleChange);

/*
 * Sync all files in fileSystemObjects to FS
 * and delete the files in fs that does not exist
 * in fileSystemObjects
 */
async function syncAppFilesWithGit() {
    console.log("Starting app sync to git, using git dir: ", currentGitDir);
    const appFsos = store.getState().app.fileSystemObjects;
    const gitFsos = await git.listFiles({ fs, dir: currentGitDir });

    const appFolders = appFsos.filter(f => f.type === "folder");
    const appFiles = appFsos.filter(f => f.type === "file");

    const appFoldersSorted = appFolders.sort((a, b) => {
        const aParts = a.path.split("/");
        const bParts = b.path.split("/");
        return aParts.length > bParts.length ? 1 : -1;
    });

    // Create folders that doesn't exist in fs.
    let fsContent;
    for (let i = 0; i < appFoldersSorted.length; i++) {
        const folder = appFoldersSorted[i];
        const parts = folder.path.split("/");
        for (let y = 1; y < parts.length; y++) {
            const path = parts.slice(0, y).join("/");
            fsContent = await pfs.readdir(`${currentGitDir}${path}`);
            if (fsContent.indexOf(parts[y]) < 0) {
                await pfs.mkdir(`${currentGitDir}${path}/${parts[y]}`);
            }
        }
    }

    // Update all files in git
    console.log("Updating all files in git", appFiles);
    for (let i = 0; i < appFiles.length; i++) {
        try {
            await writeFileContent(pfs, `${currentGitDir}${appFiles[i].path}`, appFiles[i].content);
        } catch (e) {
            console.log("Error updating file: ", appFiles[i]);
            console.log("Message: ", e.message);
        }
    }
    console.log("Done updating all files in git");

    // Check if there are any files in git that does not exist in app.
    for (let i = 0; i < gitFsos.length; i++) {
        const gitFile = gitFsos[i];
        const appFile = appFsos.find(f => f.path === `/${gitFile}`);
        if (!appFile) {
            try {
                console.log("File does not exist in app", gitFile);
                // File does not exist in app. Delete from git.
                const fileStatus = await git.status({ fs, dir: currentGitDir, filepath: gitFile });
                // Don't unlink if it already is.
                if (fileStatus.indexOf("deleted") < 0) {
                    await pfs.unlink(`${currentGitDir}/${gitFile}`);
                    await git.remove({ fs, dir: currentGitDir, filepath: `/${gitFile}` });
                }
            } catch (e) {
                console.log("Error removing file from git", e.message);
            }
        }
    }

    console.log("Done syncing app files to git");
}

/*
 * Sync all files in fs to App
 * and delete the files in app that does not exist
 * in fs
 */
async function syncGitFilesWithApp() {
    console.log("starting git sync to app, using git dir: ", currentGitDir);
    const appFsos = store.getState().app.fileSystemObjects;
    const gitFsos = await git.listFiles({ fs, dir: currentGitDir });

    const appFolders = appFsos.filter(f => f.type === "folder");
    const appFiles = appFsos.filter(f => f.type === "file");

    const createdFolders = [];
    const fsosToCreate = [];
    const fsosToSave = [];
    const fsosToDelete = [];

    for (let i = 0; i < gitFsos.length; i++) {
        const filePath = gitFsos[i];
        const appFile = appFiles.find(f => f.path === `/${filePath}`);
        if (!appFile) {
            const parts = filePath.split("/");
            // Create app file and maybe folder(s)
            for (let y = 1; y < parts.length; y++) {
                const folderPath = parts.slice(0, y).join("/");

                if (createdFolders.indexOf(folderPath) < 0 && !appFolders.find(f => f.path === `/${folderPath}`)) {
                    createdFolders.push(folderPath);
                    fsosToCreate.push({
                        path: "/" + folderPath,
                        type: "folder"
                    });
                }
            }
            const fileContent = await getFileContent(pfs, `${currentGitDir}/${filePath}`);

            fsosToCreate.push({
                type: "file",
                path: "/" + filePath,
                content: fileContent
            });
        } else {
            // Sync the file with app.
            const content = await getFileContent(pfs, `${currentGitDir}/${filePath}`);
            fsosToSave.push({
                ...appFile,
                content
            });
        }
    }

    for (let i = 0; i < appFiles.length; i++) {
        const appFile = appFiles[i];
        const gitFile = gitFsos.find(filePath => `/${filePath}` === appFile.path);
        if (!gitFile) {
            console.log("Could not find git file: ", appFile, gitFile);
            fsosToDelete.push({
                id: appFile.id,
            });
        }
    }

    console.log("syncGitFilesWithApp done");

    if (fsosToDelete.length > 0) {
        store.dispatch(deleteFsos(fsosToDelete));
    }

    if (fsosToCreate.length > 0) {
        store.dispatch(createFsos(fsosToCreate));
    }

    if (fsosToSave.length > 0) {
        store.dispatch(save(fsosToSave));
    }

    store.dispatch(endGitClone());
}

async function appendFileStatus(filepath) {
    const status = await git.status({ fs, dir: currentGitDir, filepath });
    return `${status} ${filepath}`;
}

const FILE = 0,
    HEAD = 1,
    WORKDIR = 2,
    STAGE = 3;

class GitCommand {
    private static async getUntrackedFiles() {
        return (await git.statusMatrix({ fs, dir: currentGitDir })).filter(row => row[HEAD] === 0 && row[WORKDIR] === 2 && row[STAGE] === 0).map(row => row[FILE]);
    }

    private static async getUnstagedChanges() {
        return (await git.statusMatrix({ fs, dir: currentGitDir })).filter(row => row[HEAD] !== row[WORKDIR] && row[WORKDIR] !== row[STAGE] && row[HEAD] !== 0).map(row => row[FILE]);
    }

    private static async getStagedChanges() {
        return (await git.statusMatrix({ fs, dir: currentGitDir })).filter(row => row[HEAD] !== row[STAGE] && (row[STAGE] === 2 || row[STAGE] === 3 || row[STAGE] === 0)).map(row => row[FILE]);
    }

    private static async getModifiedFiles() {
        return (await git.statusMatrix({ fs, dir: currentGitDir })).filter(row => row[HEAD] !== row[WORKDIR]).map(row => row[FILE]);
    }

    static async status(args, opts, print) {
        let ret: string = `On branch ${await git.currentBranch({ fs, dir: currentGitDir })}\n`;

        const statusMatrix = await git.statusMatrix({ fs, dir: currentGitDir });
        const stagedChanges = await this.getStagedChanges();

        if (stagedChanges.length > 0) {
            ret += `Changes to be commited:\n  (use "git rm --cached <file>..." to unstage)\n \n`;
            ret += `\n${forcedChalk.green("\t" + (await Promise.all(stagedChanges.map(file => appendFileStatus(file)))).join(`\n\t`))}\n \n`;
        }

        const unstagedChanges = await this.getUnstagedChanges();
        if (unstagedChanges.length > 0) {
            ret += `Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git checkout <file>..." to discard what will be committed)\n \n`;
            ret += `\n${forcedChalk.red("\t" + (await Promise.all(unstagedChanges.map(file => appendFileStatus(file)))).join(`\n\t`))}\n \n`;
        }

        const untrackedFiles = await this.getUntrackedFiles();
        if (untrackedFiles.length > 0) {
            ret += `Untracked files:\n  (use "git add <file>..." to include what will be committed)\n \n`;
            ret += `\n${forcedChalk.red("\t" + (await Promise.all(untrackedFiles.map(file => appendFileStatus(file)))).join(`\n\t`))}\n \n`;
        }

        if (stagedChanges.length < 1 && unstagedChanges.length < 1 && untrackedFiles.length < 1) {
            ret += `\nnothing to commit, working tree clean\n`;
        }

        return ret;
    }

    static async diff(args, opts, print) {
        const branch = await git.currentBranch({ fs, dir: currentGitDir });
        const sha = await git.resolveRef({ fs, dir: currentGitDir, ref: branch });
        let diffFiles;
        if (opts.cached) {
            diffFiles = await this.getStagedChanges();
        } else {
            diffFiles = await this.getUnstagedChanges();
        }

        if (args[0]) {
            diffFiles = diffFiles.filter(f => new RegExp(args[0], "g").test(f));
        }

        let ret = "";
        for (let i = 0; i < diffFiles.length; i++) {
            const filepath = diffFiles[i];
            let { object: fileHEAD } = await git.readObject({ fs, dir: currentGitDir, oid: sha, filepath, encoding: "utf8" });
            let fileWORKDIR = await getFileContent(pfs, `${currentGitDir}/${filepath}`);

            const diff = JsDiff.structuredPatch(filepath, filepath, fileHEAD, fileWORKDIR);

            ret += forcedChalk.yellow("diff --git a/" + filepath + " b/" + filepath);
            ret +=
                "\n" +
                diff.hunks
                    .map(hunk =>
                        hunk.lines
                            .map(line => {
                                if (line.charAt(0) === "-") {
                                    return forcedChalk.red(line);
                                } else if (line.charAt(0) === "+") {
                                    return forcedChalk.green(line);
                                } else {
                                    return line;
                                }
                            })
                            .join("\n")
                    )
                    .join("\n");
            ret += "\n";
        }
        return ret;
    }

    static async log(args, opts, print) {
        let depth = args[0] ? Math.abs(args[0]) : 10;
        const commits = await git.log({ fs, dir: currentGitDir, depth });

        let ret = "";
        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];
            console.log("Commit: ", commit);
            ret += forcedChalk.yellow(`commit ${commit.oid}\n`);
            ret += `Author: ${commit.commit.committer.name} <${commit.commit.committer.email}>\n`;
            ret += `Date: ${new Date(parseInt(commit.commit.committer.timestamp + '000'))}\n \n`;
            ret += `\t ${commit.commit.message}\n \n`;
        }

        console.log("Done", ret);
        return ret;
    }

    static async add(args, opts, print) {
        if (!args.length) {
            return `Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?`;
        } else if (args.length === 1 && args[0] === ".") {
            const modifiedPaths = await this.getModifiedFiles();
            for (let i = 0; i < modifiedPaths.length; i++) {
                const filepath = modifiedPaths[i];
                const fileStatus = await git.status({ fs, dir: currentGitDir, filepath });
                console.log("Running git add for filepath: ", filepath, fileStatus);
                if (fileStatus.indexOf("deleted") > -1) {
                    await git.remove({ fs, dir: currentGitDir, filepath });
                } else {
                    await git.add({ fs, dir: currentGitDir, filepath });
                }
            }
        } else if (args.length === 1) {
            let modifiedPaths = await this.getModifiedFiles();
            modifiedPaths = modifiedPaths.filter(f => new RegExp(args[0], "g").test(f));
            for (let i = 0; i < modifiedPaths.length; i++) {
                const filepath = modifiedPaths[i];
                console.log("Running git add for filepath: ", filepath);
                await git.add({ fs, dir: currentGitDir, filepath });
            }
        }
    }

    static async checkout(args, opts, print) {
        const currentBranch = await git.currentBranch({ fs, dir: currentGitDir });

        if (!args.length) {
            return;
        } else if (args.length === 1 && args[0] === ".") {
            await git.checkout({ fs, dir: currentGitDir, ref: currentBranch, force: true });
            await syncGitFilesWithApp();
        } else if (args.length === 1) {
            // Is this a branch or a file path.
            const arg = args[0];
            const branches = await git.listBranches({ fs, dir: currentGitDir });
            if (branches.indexOf(arg) > -1) {
                if (currentBranch === arg) {
                    return `Already on '${currentBranch}'`;
                }
                return "Switching branches is not supported yet";
                //await git.checkout({dir: currentGitDir, ref: arg});
            } else {
                const unstagedFiles = await this.getUnstagedChanges();
                const filesToCheckout = unstagedFiles.filter(f => new RegExp(args[0], "g").test(f));
                await git.checkout({ fs, dir: currentGitDir, ref: currentBranch, filepaths: filesToCheckout, force: true });
                await syncGitFilesWithApp();
            }
        }
    }

    static async commit(args, opts, print) {
        if (opts.m) {
            return await git.commit({ fs, dir: currentGitDir, author: { name: configUser.name, email: configUser.email }, message: opts.m });
        } else {
            return `Aborting commit due to empty commit message`;
        }
    }

    static async push(args, opts, print) {
        const branch = await git.currentBranch({ fs, dir: currentGitDir });
        console.log("Git push: ", branch, args, opts);
        let remote;
        if (!args[0]) {
            const remotes = await git.listRemotes({ fs, dir: currentGitDir });
            if (remotes[0]) {
                remote = remotes[0].remote;
            } else {
                let error = `fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using`;
                error += `\n \n\tgit remote add <name> <url>\n \n`;
                error += `and then push the remote name\n \n\tgit push <name>`;
                return error;
            }
        } else {
            remote = args[0];
        }

        const token = configUser.token;
        const result = await git.push({
            fs,
            http,
            dir: currentGitDir,
            corsProxy,
            ref: branch,
            remote,
            onAuth: () => ({ username: token }),
            onMessage: print,
            force: opts.force ? true : false
        });

        let message = ``;
        if (result.ok && result.ok.length > 0) {
            message = result.ok.map(m => m).join("\n");
        }
        if (result.errors && result.errors.length > 0) {
            message += result.errors.map(m => m).join("\n");
        }
        return message;
    }

    static async pull(args, opts, print) {
        const ref = args[0];

        const result = await git.pull({
            fs,
            http,
            dir: currentGitDir,
            corsProxy,
            ref,
            singleBranch: true,
            fastForwardOnly: false,
            author: {
                name: configUser.name,
                email: configUser.email
            },
            onAuth: () => ({ username: configUser.token }),
            onMessage: print
        });
        await syncGitFilesWithApp();

        return result;
    }

    static async stash(args, opts, print) {
        throw "Not implemented";
    }

    static async remote(args, opts, print) {
        const subCommand = args[0];
        if (subCommand === "add") {
            if (!args[1] || !args[2]) return `usage: git remote add <name> <url>`;
            await git.addRemote({ fs, dir: currentGitDir, remote: args[1], url: args[2] });
        } else {
            if (opts.v) {
                const remotes = (await git.listRemotes({ fs, dir: currentGitDir }))
                    .map(remote => {
                        return `${remote.remote} ${remote.url}`;
                    })
                    .join("\n");
                console.log(remotes);
                return remotes;
            } else {
                return `Unknown subcommand: ${args[0]}`;
            }
        }
    }

    static async clone(args, opts, print) {
        return `If you want to clone a git repository please create a new project`;
    }
}

export async function runCommand(command, terminalPrintLine) {
    if (!command) return "";
    if (!currentGitDir) return "Not a git repository";

    const parsedCommand = yargs(command);
    const _ = parsedCommand._;
    delete parsedCommand._;

    if (_[0] !== "git") {
        return `${_[0]} is not recognized as a command`;
    }

    try {
        if (typeof GitCommand[_[1]] === "function") {
            return await GitCommand[_[1]](_.slice(2), parsedCommand, terminalPrintLine);
        } else {
            return `git: '${_[1]}' is not a git command. See 'git --help'`;
        }
    } catch (e) {
        if (e.message) {
            return e.message;
        } else {
            return e;
        }
    }
}

export async function cloneGitRepo(url: string) {
    store.dispatch(startGitCloneClone());
    async function clone() {
        console.log("Start clone");
        await git.clone({
            fs,
            http,
            dir: currentGitDir,
            corsProxy,
            url,
            singleBranch: false,
            noCheckout: false,
            noTags: true,
            depth: 100
        });
        gitEmitter.removeEventListener("initEnd", clone);
        console.log("Clone done");
        await syncGitFilesWithApp();
    }

    console.log("Starting git clone");
    if (gitEmitter.isInitializing) {
        console.log("Git is initializing, waiting...");
        gitEmitter.addEventListener("initEnd", clone);
    } else {
        console.log("Running git clone2");
        await clone();
    }
}

export async function deleteGitRepo(folder = currentAppName) {
    const dir = "/" + folder;
    if (folder === currentAppName) {
        console.log("Deleting git repo: ", folder);
    }
    try {
        const folderContents = await pfs.readdir(dir);
        for (let i = 0; i < folderContents.length; i++) {
            const item = "/" + folderContents[i];
            const stat = await pfs.stat(dir + item);
            if (stat.type === "dir") {
                await deleteGitRepo(dir + item);
            } else {
                await pfs.unlink(dir + item);
            }
        }
        await pfs.rmdir(dir);
        const files = await git.listFiles({ fs, dir: `/${currentAppName}` });
        for (let i = 0; i < files.length; i++) {
            await git.remove({ fs, dir: `/${currentAppName}`, filepath: files[i] });
        }
    } catch (e) {
        console.log("Error deleting repository: ", e.message, dir);
    }
}

export async function syncFile({ id, path, content, type }: { id: string; path: string; content: string, type: "file" | "folder" }, originalFso?: FileSystemObject) {
    try {
        if (type === "file") {
            if (originalFso && originalFso.path !== path) {
                console.log(id, "Deleting from fs: ", originalFso.path, path);
                await pfs.unlink(`${currentGitDir}${originalFso.path}`);
                await git.remove({ fs, dir: currentGitDir, filepath: originalFso.path });
            }
            console.log(id, "Syncing file to fs", path);

            const parts = path.split("/");
            for (let i = 1; i < parts.length; i++) {
                const path = parts.slice(0, i).join("/");
                if (!await fsExists(pfs, `${currentGitDir}${path}`)) {
                    console.log(id, "Creating folder: ", `${currentGitDir}${path}`);
                    await pfs.mkdir(`${currentGitDir}${path}`);
                }
            }

            await writeFileContent(pfs, `${currentGitDir}${path}`, content);
        } else {
            console.log(id, "Making dir", path);
            await pfs.mkdir(`${currentGitDir}${path}`);
        }
    } catch (e) {
        console.log(id, "Error syncing fso to fs: ", e.message);
    }
}

export async function removeFile(fileId: string) {
    const file = getFileById(fileId);
    try {
        console.log("Removing file from git", file.path);
        await pfs.unlink(`${currentGitDir}${file.path}`);
        await git.remove({ fs, dir: currentGitDir, filepath: file.path });
    } catch (e) {
        console.log("Error deleting file from fs or removing from git", e.message);
    }
}

export async function getFsoDeltaDecorations(filePath: string, fileContent: string): Promise<monaco.editor.IModelDeltaDecoration[]> {
    // Remove the leading slash in the filepath.
    filePath = filePath.substring(1);

    const branch = await git.currentBranch({ fs, dir: currentGitDir });
    const sha = await git.resolveRef({ fs, dir: currentGitDir, ref: branch });

    let { object: fileHEAD } = await git.readObject({ fs, dir: currentGitDir, oid: sha, filepath: filePath, encoding: "utf8" });

    const diff = JsDiff.structuredPatch(filePath, filePath, fileHEAD as string, fileContent, null, null, { ignoreWhitespace: true });
    console.log("Structured diff: ", diff);

    const deltaRanges: { type: 'added' | 'removed', start: number, end: number }[] = [];

    if (diff.hunks.length > 0) {
        let deltaCount = 0;

        for (let i = 0; i < diff.hunks.length; i++) {
            const hunk = diff.hunks[i];

            let lineIndex = 0;
            for (let y = 0; y < hunk.lines.length; y++) {
                const line = hunk.lines[y];
                const firstChar = line.charAt(0);

                if (firstChar !== '-') {
                    lineIndex++;
                }

                // End delta decorator
                if (deltaRanges[deltaCount]) {
                    if (deltaRanges[deltaCount].type === 'added' && firstChar !== "+") {
                        deltaRanges[deltaCount].end = lineIndex + hunk.newStart;
                        deltaCount++;
                    }
                    else if (deltaRanges[deltaCount].type === 'removed' && firstChar !== "-") {
                        deltaRanges[deltaCount].end = lineIndex + hunk.newStart;
                        deltaCount++;
                    }
                }
                
                // Start delta decorator
                if (!deltaRanges[deltaCount]) {
                    if (firstChar === '+') {
                        const start = (lineIndex + hunk.newStart) - 1;
                        deltaRanges[deltaCount] = { type: "added", start, end: null }                        
                    }
                    else if (firstChar === '-') {
                        const start = (lineIndex + hunk.newStart) - 1;
                        deltaRanges[deltaCount] = { type: "removed", start, end: null }                        
                    }
                }

                if (y === hunk.lines.length - 1) {
                    if (deltaRanges[deltaCount] && !deltaRanges[deltaCount].end) {
                        deltaRanges[deltaCount].end = (lineIndex + hunk.newStart) - 1;
                        deltaCount++;
                    }
                }
            }
        }
    }

    console.log("Delta ranges: ", deltaRanges);
    const deltaDecorators: monaco.editor.IModelDeltaDecoration[] = [];
    for (let i = 0; i < deltaRanges.length; i++) {
        const range = deltaRanges[i];
        if (range.type === "added") {
            deltaDecorators.push({
                range: new monaco.Range(range.start, 1, range.end, 1),
                options: { isWholeLine: true, linesDecorationsClassName: "deltaMonacoAdded" }
            })
        }
    }
    console.log("Decorators: ", deltaDecorators);
    return deltaDecorators;
}

export async function renameFolderGit(oldPath, newPath) {
    await pfs.rename(`${currentGitDir}${oldPath}`, `${currentGitDir}${newPath}`);
}


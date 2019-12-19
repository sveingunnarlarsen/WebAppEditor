import store from "../store";
import yargs from "yargs-parser";
import globby from "globby";
import {updateFileState} from "../actions/app";
import * as JsDiff from "diff";
import * as chalk from "chalk";
let options: any = {enabled: true, level: 2};
const forcedChalk = new chalk.constructor(options);

// TODO: Should use the planet9 proxy.
const corsProxy = "https://cors.isomorphic-git.org";
window.fs = new LightningFS("fs");
git.plugins.set("fs", window.fs);
window.pfs = window.fs.promises;
window.git = git;

let currentAppName: string;
let currentGitDir: string;

async function handleChange() {
	//Switch to new project.
	if (store.getState().app.name && store.getState().app.name != currentAppName) {
		currentAppName = store.getState().app.name;
		currentGitDir = `/${currentAppName}`;

		try {
			await pfs.readdir(`${currentGitDir}/.git`);
			await syncFilesToFS();
		} catch (e) {
			if (e.message.indexOf("ENOENT") > -1) {
				pfs.mkdir(currentGitDir);
				await git.init({dir: currentGitDir});
				await syncFilesToFS();
			} else {
				console.log("Failed to initialize git", e.message);
			}
		}
	}
}

store.subscribe(handleChange);

async function syncFilesToFS() {
	console.log("Syncing all files to fs");
	const fsos = store.getState().app.fileSystemObjects;
	try {
		const folders = fsos.filter(f => f.type === "folder");
		const files = fsos.filter(f => f.type === "file");

		const foldersSorted = folders.sort((a, b) => {
			const aParts = a.path.split("/");
			const bParts = b.path.split("/");
			return aParts.length > bParts.length ? 1 : -1;
		});

		let fsContent;
		for (let i = 0; i < foldersSorted.length; i++) {
			const folder = foldersSorted[i];
			const parts = folder.path.split("/");
			for (let y = 1; y < parts.length; y++) {
				const path = parts.slice(0, y).join("/");
				fsContent = await pfs.readdir(`${currentGitDir}${path}`);
				if (fsContent.indexOf(parts[y]) < 0) {
					await pfs.mkdir(`${currentGitDir}${path}/${parts[y]}`);
				}
			}
		}
		for (let i = 0; i < files.length; i++) {
			await pfs.writeFile(`${currentGitDir}${files[i].path}`, files[i].content, "utf8");
		}
	} catch (e) {
		console.log("Error syncing files to fs: ", e.message);
	}
}

async function syncFilesFromFS(pattern) {
	let files = await git.listFiles({dir: currentGitDir});
	if (pattern) {
		files = files.filter(f => new RegExp(pattern, "g").test(f));
		if (files.length < 1) {
			throw Error(`error: pathspec '${pattern} did not match any files(s) know to git'`);
		}
	}

	for (let i = 0; i < files.length; i++) {
		try {
			const filepath = files[i];
			const fileContent = await pfs.readFile(`${currentGitDir}/${filepath}`, "utf8");
			// Remove git directory before updating file in project
			store.dispatch(updateFileState({path: "/" + filepath, content: fileContent}));
		} catch (e) {
			console.log("Trouble reading file: ", e.message, files[i]);
		}
	}
}

async function appendFileStatus(filepath) {
	const status = await git.status({dir: currentGitDir, filepath});
	return `${status} ${filepath}`;
}

const FILE = 0,
	HEAD = 1,
	WORKDIR = 2,
	STAGE = 3;

class GitCommand {
	private static async getUntrackedFiles() {
		return (await git.statusMatrix({dir: currentGitDir})).filter(row => row[HEAD] === 0 && row[WORKDIR] === 2 && row[STAGE] === 0).map(row => row[FILE]);
	}

	private static async getUnstagedChanges() {
		return (await git.statusMatrix({dir: currentGitDir})).filter(row => row[HEAD] !== row[WORKDIR] && row[WORKDIR] !== row[STAGE] && row[HEAD] !== 0).map(row => row[FILE]);
	}

	private static async getStagedChanges() {
		return (await git.statusMatrix({dir: currentGitDir})).filter(row => row[HEAD] !== row[STAGE] && (row[STAGE] === 2 || row[STAGE] === 3)).map(row => row[FILE]);
	}

	private static async getModifiedFiles() {
		return (await git.statusMatrix({dir: currentGitDir})).filter(row => row[HEAD] !== row[WORKDIR]).map(row => row[FILE]);
	}

	static async status(args, opts) {
		let ret: string = `On branch ${await git.currentBranch({dir: currentGitDir})}\n`;

		const statusMatrix = await git.statusMatrix({dir: currentGitDir});
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

	static async diff(args, opts) {
		const branch = await git.currentBranch({dir: currentGitDir});
		const sha = await git.resolveRef({dir: currentGitDir, ref: branch});
		let diffFiles;
		if (opts.cached) {
			diffFiles = await this.getStagedChanges();
		} else {
			diffFiles = (await this.getUntrackedFiles()).concat(await this.getUnstagedChanges());
		}

		if (args[0]) {
			diffFiles = diffFiles.filter(f => new RegExp(args[0], "g").test(f));
		}

		let ret = "";
		for (let i = 0; i < diffFiles.length; i++) {
			const filepath = diffFiles[i];
			let {object: fileHEAD} = await git.readObject({dir: currentGitDir, oid: sha, filepath, encoding: "utf8"});
			let fileWORKDIR = await pfs.readFile(`${currentGitDir}/${filepath}`, "utf8");

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

	static async log(args, opts) {
		let depth = args[0] ? Math.abs(args[0]) : 10;
		const commits = await git.log({dir: currentGitDir, depth});

		let ret = "";
		for (let i = 0; i < commits.length; i++) {
			const commit = commits[i];
			ret += forcedChalk.yellow(`commit ${commit.oid}\n`);
			ret += `Author: ${commit.committer.name} <${commit.committer.email}>\n`;
			ret += `Date: ${new Date(commit.committer.timestamp)}\n \n`;
			ret += `\t ${commit.message}\n \n`;
		}

		return ret;
	}

	static async add(args, opts) {
		if (!args.length) {
			return `Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?`;
		} else if (args.length === 1 && args[0] === ".") {
			const modifiedPaths = await this.getModifiedFiles();
			for (let i = 0; i < modifiedPaths.length; i++) {
				const filepath = modifiedPaths[i];
				console.log("Running git add for filepath: ", filepath);
				await git.add({dir: currentGitDir, filepath});
			}
		} else if (args.length === 1) {
			let modifiedPaths = await this.getModifiedFiles();
			modifiedPaths = modifiedPaths.filter(f => new RegExp(args[0], "g").test(f));
			for (let i = 0; i < modifiedPaths.length; i++) {
				const filepath = modifiedPaths[i];
				console.log("Running git add for filepath: ", filepath);
				await git.add({dir: currentGitDir, filepath});
			}
		}
	}

	static async checkout(args, opts) {
		const currentBranch = await git.currentBranch({dir: currentGitDir});

		if (!args.length) {
			return;
		} else if (args.length === 1 && args[0] === ".") {
			await git.checkout({dir: currentGitDir, ref: currentBranch});
			await syncFilesFromFS();
		} else if (args.length === 1) {
			// Is this a branch or a file path.
			const arg = args[0];
			const branches = await git.listBranches({dir: currentGitDir});
			if (branches.indexOf(arg) > -1) {
				if (currentBranch === arg) {
					return `Already on '${currentBranch}'`;
				}
				return "Switching branches is not supported yet";
				//await git.checkout({dir: currentGitDir, ref: arg});
			} else {
				// TODO: Check that the filepath is actually a file path.
				await git.fastCheckout({dir: currentGitDir, force: true, filepaths: [arg]});
				await syncFilesFromFS(arg);
			}
		}
	}

	static async commit(args, opts) {
		if (opts.m) {
			// TODO: Git config, user.name and user.email must be set.
			return await git.commit({dir: currentGitDir, author: {name: "Svein Gunnar Larsen", email: "svein.gunnar.larsen@gmail.com"}, message: opts.m});
		} else {
			return `Aborting commit due to empty commit message`;
		}
	}

	static async push(args, opts) {
		const branch = await git.currentBranch({dir: currentGitDir});
		console.log("Git push: ", branch, args, opts);
		let result, remote;

		if (!args[0]) {
			const remotes = await git.listRemotes({dir: currentGitDir});
			if (remotes[0]) {
				remote = remotes[0].remote;
			} else {
				const error = `fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using`;
				error += `\n \n\tgit remote add <name> <url>\n \n`;
				error += `and then push the remote name\n \n\tgit push <name>`;
				return error;
			}
		} else {
			remote = args[0];
		}

		if (opts.force) {
			result = await git.push({
				dir: currentGitDir,
				corsProxy,
				ref: branch,
				remote,
				username: opts.username,
				password: opts.password,
				token: opts.token,
				force: true
			});
		} else {
			result = await git.push({
				dir: currentGitDir,
				corsProxy,
				ref: branch,
				remote,
				username: opts.username,
				password: opts.password,
				token: opts.token
			});
		}

		let message = ``;
		if (result.ok && result.ok.length > 0) {
			message = result.ok.map(m => m).join("\n");
		}
		if (result.errors && result.errors.length > 0) {
			message += result.errors.map(m => m).join("\n");
		}
		return message;
	}

	static async pull(args, opts) {
		throw "Not implemented";
	}

	static async stash(args, opts) {
		throw "Not implemented";
	}

	static async remote(args, opts) {
		const subCommand = args[0];
		if (subCommand === "add") {
			if (!args[1] || !args[2]) return `usage: git remote add <name> <url>`;
			await git.addRemote({dir: currentGitDir, remote: args[1], url: args[2]});
		} else {
			if (opts.v) {
				const remotes = (await git.listRemotes({dir: currentGitDir}))
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
}

export async function runCommand(command) {
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
			return await GitCommand[_[1]](_.slice(2), parsedCommand);
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

export async function syncFile({path, content}: {path: string; content: string}) {
	try {
		await pfs.writeFile(`${currentGitDir}${path}`, content, "utf8");
	} catch (e) {
		console.log("Error syncing file to fs: ", e.message);
	}
}

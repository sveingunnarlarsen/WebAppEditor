import {getFileTypeImageData} from "../helpers/utils";

export function convertApiWebAppData(json) {
	const app = json.app;
	const fsos = app.fileSystemObjects.map((f, i, array) => extractFileMeta(f, array));
	const folders = fsos.filter(f => f.type === "folder").sort((a, b) => (a.name > b.name ? 1 : -1));
	const files = fsos.filter(f => f.type === "file").sort((a, b) => (a.name > b.name ? 1 : -1));
	app.updateTree = true;
	app.fileSystemObjects = [...folders].concat([...files]);
	return app;
}

export function extractFileMeta(item, fsos) {
	let parentId;
	try {
		//Split path and remove first /, i.e. /folder/subFolder/file.txt
		const parts = item.path.split("/");
		parts.shift();
		const name = parts.pop();
		const parentPath = "/" + parts.join("/");
		if (parentPath.length === 1) {
			parentId = "1";
		} else {
			parentId = fsos.filter(f => f.path === parentPath)[0].id;
		}
		if (item.type === "file") {
			const splitFile = name.split(".");
			const fileType = splitFile.pop();
			const image = getFileTypeImageData(fileType);
			return Object.assign(item, {
				name,
				value: name,
				fileType,
				parentId,
				image,
				disabled: false,
				orgContent: item.content,
				modified: false
			});
		} else {
			return Object.assign(item, {
				name,
				value: name,
				parentId,
				image: "",
				disabled: false
			});
		}
	} catch (e) {
		return Object.assign(item, {
			value: "Error",
			parentId: parentId ? parentId : "1",
			name: "Error extracting file meta",
			error: e.message
		});
	}
}

export function getFolderPath(id, fsos) {
	const item = fsos.find(f => f.id === id);
	if (item && item.type === "folder") {
		return item.path;
	} else if (item && item.type === "file") {
		const parts = item.path.split("/");
		parts.shift();
		parts.pop();
		return "/" + parts.join("/");
	}
}

export function extractServerProps({id, path, type, webAppId, content, createdAt, updatedAt, createdBy, changedBy}) {
	return {
		id,
		path,
		type,
		webAppId,
		content,
	};
}

import imageData from "../data/images.json";

export function convertFlatToNested(n, r, t) {
	for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) (e = n[o]), (h = e[r]), (u = e[t] || 0), (c[h] = c[h] || []), (e.data = c[h]), 0 != u ? ((c[u] = c[u] || []), c[u].push(e)) : a.push(e);
	return a;
}

export function getFileTypeImageData(fileType) {
	const imageMeta = imageData.items.filter(i => i.type === fileType)[0];
	return imageMeta ? imageMeta.image : "";
}

export function replaceNameInPath(fullPath, newName) {
	const parts = fullPath.split("/");
	parts[parts.length - 1] = newName;
	return parts.join("/");
}

export function getLineAndContentByChar(text, char) {
	const tempText = text.substring(0, char);
	const lineNumber = tempText.split("\n").length;
	const lineContent = text.split("\n")[lineNumber - 1];
	return {
		lineNumber,
		lineContent
	};
}

export function folderExists(path, fsos) {}

export function base64ToArrayBuffer(base64) {
	var binary_string = atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}

export function arrayBufferToBase64(buffer) {
	return btoa(
		new Uint8Array(buffer).reduce(function(data, byte) {
			return data + String.fromCharCode(byte);
		}, "")
	);
}

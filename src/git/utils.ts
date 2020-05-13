import {base64ToArrayBuffer, arrayBufferToBase64, isImage} from "../helpers/utils";
const decoder = new TextDecoder('utf8');

export async function getFileContent(pfs, filePath: string) {
    const buffer = await pfs.readFile(filePath);
    if (isImage(filePath)) {
        return arrayBufferToBase64(buffer);
    } else {
        return decoder.decode(buffer);
    }
}

export async function writeFileContent(pfs, filePath: string, content: string) {
    if (isImage(filePath)) {
        await pfs.writeFile(filePath, base64ToArrayBuffer(content));
    } else {
        await pfs.writeFile(filePath, content, "utf8");
    }
} 

export async function fsExists(pfs, path) {
    try {
        const res = await pfs.stat(path);
        return true;
    } catch (e) {
        return false;
    }
}
import {arrayBufferToBase64, isImage} from "../helpers/utils";
const decoder = new TextDecoder('utf8');

export async function getFileContent(pfs, filePath: string) {
    const buffer = await pfs.readFile(filePath);
    if (isImage(filePath)) {
        return arrayBufferToBase64(buffer);
    } else {
        return decoder.decode(buffer);
    }
}
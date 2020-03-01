
import * as imageType from "image-type";
window.imageType = imageType;

const decoder = new TextDecoder('utf8');

export async function getFileContent(pfs, filePath: string) {
    const buffer = await pfs.readFile(filePath);
    const imageMeta = imageType(buffer);
    if (imageMeta) {
        return btoa(String.fromCharCode.apply(null, buffer));
    } else {
        return decoder.decode(buffer);
    }
}

export async function checkIfImage(base64) {
    
}
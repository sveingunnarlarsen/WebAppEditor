
import * as imageType from "image-type";
import {arrayBufferToBase64} from "../helpers/utils";

const decoder = new TextDecoder('utf8');

export async function getFileContent(pfs, filePath: string) {
    const buffer = await pfs.readFile(filePath);
    const imageMeta = imageType(buffer);
    if (imageMeta) {
        return arrayBufferToBase64(buffer);
    } else {
        return decoder.decode(buffer);
    }
}
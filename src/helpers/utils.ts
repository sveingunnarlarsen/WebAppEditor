import imageData from "../data/images.json";
import md5 from "blueimp-md5";
import mime from "mime-types";
import moment from "moment";

export function generateGravatarLink(email: string) {
    email = email ? email : '';
    email = email.trim().toLowerCase();
    console.log("Email: ", email);
    const hash = md5(email);
    return email ? `http://www.gravatar.com/avatar/${hash}?s=40&d=retro&r=g` : '';
}

export function formatDate(date: string) {
    return moment(date).format('LLL');
}

export function convertFlatToNested(n, r, t) {
    for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) (e = n[o]), (h = e[r]), (u = e[t] || 0), (c[h] = c[h] || []), (e.data = c[h]), 0 != u ? ((c[u] = c[u] || []), c[u].push(e)) : a.push(e);
    return a;
}

export function sortFoldersAndFiles(a, b) {
    if (a.type === b.type) {
        if (a.path.split('/').length > b.path.split('/').length) {
            return 1;
        } else if (a.path.split('/').length === b.path.split('/').length) {
            if (a.name > b.name) {
                return 1;
            } else {
                return -1;
            }            
        } else {
            return -1;
        }
    } else {
        return a.type === 'folder' ? -1 : 1;
    }
}

export function extend(...args: any[]) {
    let extended = {};
    let deep = false;
    let i = 0;
    let length = args.length;

    if (Object.prototype.toString.call(args[0]) === '[object Boolean]') {
        deep = args[0];
        i++;
    }

    const merge = function(obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    extended[prop] = extend(true, extended[prop], obj)
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    }

    for (; i < length; i++) {
        let obj = arguments[i];
        merge(obj);
    }

    return extended;
}

export function getFileTypeImageData(fileType) {
    const imageMeta = imageData.items.filter(i => i.type === fileType)[0];
    return imageMeta ? imageMeta.image : "";
}

export function replaceNameInPath(fullPath: string, newName: string): string {
    const parts = fullPath.split("/");
    parts[parts.length - 1] = newName;
    return parts.join("/");
}

export function replaceFolderPath(fullPath: string, newFolderPath: string) : string {
    const parts = fullPath.split("/");
    return `${newFolderPath}/${parts[parts.length - 1]}`;
}

export function getLineAndContentByChar(text, char): { lineNumber: number; lineContent: string } {
    const tempText = text.substring(0, char);
    const lineNumber = tempText.split("\n").length;
    const lineContent = text.split("\n")[lineNumber - 1];
    return {
        lineNumber,
        lineContent
    };
}

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

export function isImage(filepath) {
    return filepath.toLowerCase().match(/.(bmp|cod|gif|ief|jpe|jpeg|jpg|jfif|svg|tif|tiff|ttf|ras|cmx|ico|pnm|png|pbm|pgm|ppm|rgb|xbm|xpm|xwd)$/i);
}

export function getFileLanguage(filepath: string) {
    const fileExtension = filepath.split(".")[filepath.split(".").length - 1];

    switch (fileExtension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        default:
            return fileExtension;
    }
}

export function getMimeType(filepath) {
    return mime.lookup(filepath);
}

export function calculateContextPos({ x, y }, root) {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = root.offsetWidth;
    const rootH = root.offsetHeight;

    const right = screenW - x > rootW;
    const left = !right;
    const top = screenH - y > rootH;
    const bottom = !top;

    if (right) {
        root.style.left = `${x + 5}px`;
    }

    if (left) {
        root.style.left = `${x - rootW - 5}px`;
    }

    if (top) {
        root.style.top = `${y + 5}px`;
    }

    if (bottom) {
        root.style.top = `${y - rootH - 5}px`;
    }
}
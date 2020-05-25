import { isImage } from "./utils";
import store from "../store";
import { createFsos, save } from "../actions/file";

export async function importFolderZip(event, zipOrFolder) {
    console.log("Event to import", event);
    console.log("zipOrFolder: ", zipOrFolder);

    const data = await importFiles(event);

    const filesToCreate = [];
    const filesToSave = [];

    data.forEach(file => {
        file.path = file.path.substring(file.path.indexOf("/"));
        const existingFile = store.getState().app.fileSystemObjects.find(f => f.path === file.path);
        if (existingFile) {
            filesToSave.push({
                ...existingFile,
                content: file.content,
            });
        } else {
            filesToCreate.push(file);
        }
    });

    if (filesToCreate.length > 0) {
        store.dispatch(createFsos(filesToCreate));
    }
    if (filesToSave.length > 0) {

    }
    store.dispatch(save(filesToSave));
}

export async function importFiles(event) {
    const files = event.target.files;

    const filesMeta = [];
    const promises = [];
    for (let i = 0; i < files.length; i++) {
        console.log(files[i]);
        filesMeta.push({
            name: files[i].name,
            path: files[i].webkitRelativePath ? files[i].webkitRelativePath : undefined,
        })
        promises.push(readFile(files[i]));
    }

    return Promise.all(promises).then(function(result) {
        try {
            var data = [];
            for (var i = 0; i < result.length; i++) {
                data.push(extractFileData(result[i], filesMeta[i]));
            }
            return data;
        } catch (e) {
            return Promise.reject(e);
        }
    });
}

async function readFile(file) {
    return new Promise(function(resolve, reject) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
            resolve(event.target.result);
        };
        fileReader.onerror = function(error) {
            reject(error);
        };
        fileReader.readAsDataURL(file);
    });
}

function extractFileData(fileContent, meta) {    
    console.log(fileContent);    
    fileContent = fileContent.slice(5);
    var type = fileContent.split(";")[0];
    fileContent = fileContent.slice(type.length + 1);
    var encoding = fileContent.split(",")[0];
    fileContent = fileContent.slice(encoding.length + 1);

    let content;
    if (isImage(meta.name)) {
        content = fileContent;
    } else {
        content = atob(fileContent); 
    }

    console.log(content);

    return {
        name: meta.name,
        path: meta.path ? meta.path : undefined,
        type: 'file',
        content,
    };
}

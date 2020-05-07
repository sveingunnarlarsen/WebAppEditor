import JSZip from "jszip";
import store from "../store";
import { saveAs } from 'file-saver';

export async function exportProjectToZip() {
	const zip = new JSZip();
	const app = store.getState().app;

	for (let i = 0; i < app.fileSystemObjects.length; i++) {
	    const fso = app.fileSystemObjects[i];
	    if (fso.type === "file") {
	        zip.file(fso.path.substr(1), fso.content);
	    } else {
	        zip.folder(fso.path.substr(1));
	    }
	}
	zip.generateAsync({type: "blob"}).then(function(blob) {
		saveAs(blob, `${app.name}.zip`);
	});
}
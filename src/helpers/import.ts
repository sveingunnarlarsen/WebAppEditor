export async function importFolderZip(event, zipOrFolder) {
	console.log("Event to import", event);
	console.log("zipOrFolder: ", zipOrFolder);
	
	const data = await importFiles(event);
	console.log(data);
}

export async function importFiles(event) {
	const files = event.target.files;

    const filesMeta = [];
	const promises = [];
	for (let i = 0; i < files.length; i++) {
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
	fileContent = fileContent.slice(5);
	var type = fileContent.split(";")[0];
	fileContent = fileContent.slice(type.length + 1);
	var encoding = fileContent.split(",")[0];
	fileContent = fileContent.slice(encoding.length + 1);

	return {
		name: meta.name,
		path: meta.webkitRelativePath ? meta.webkitRelativePath : undefined,
		type: type,
		content: fileContent
	};
}

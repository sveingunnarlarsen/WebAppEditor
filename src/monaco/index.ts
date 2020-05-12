import {monaco} from "";

let monacoRef;
monaco.init()
.then(monaco => {
	monacoRef = monaco;    
})
.catch(error => {
    
})


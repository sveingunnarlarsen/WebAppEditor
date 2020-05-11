import "../../types/monaco";

export function provideDiagnostics(result, monaco) {
		console.log("Data: ", result);
		console.log("Monaco model: ", monaco.editor.getModels()[0]);
		const markerData = result.diagnostics.map(d => new ModelMarker(d));
		console.log("MarkerData: ", markerData);				
		monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "typescript", markerData);
}

class ModelMarker implements monaco.editor.IMarkerData {
    code: string | {
        value: string;
        link: monaco.Uri;
    };
    severity: monaco.MarkerSeverity;
    message: string;
    source?: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    relatedInformation?: monaco.editor.IRelatedInformation[];
    tags?: monaco.MarkerTag[];
        
    constructor({code, severity, message, range, source, relatedInformation, tags}: {
        code: string;
        severity: monaco.MarkerSeverity;
        message: string;
		range: { start: {line: number, character: number}, end: {line: number, character: number}};
		source?: string;
        relatedInformation?: monaco.editor.IRelatedInformation[];
        tags?: monaco.MarkerTag[];
	}) {
		this.code = {value: code, link: ""};
        this.severity = severity;
        this.message = message;
		this.startLineNumber = range.start.line + 1;
        this.startColumn = range.start.character + 1;
        this.endLineNumber = range.end.line + 1;
        this.endColumn = range.end.character + 1;    
		this.source = source;
        this.relatedInformation = relatedInformation;
        this.tags = tags;
    }
}
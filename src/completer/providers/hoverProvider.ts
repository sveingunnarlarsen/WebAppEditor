import "../../types/monaco";
import * as ts from 'typescript';
import {LanguageClient as LanguageClientType} from "../../types/language-client";

export class HoverProvider implements monaco.languages.HoverProvider {

    private languageClient: LanguageClientType;

    constructor(languageClient: LanguageClientType) {
        this.languageClient = languageClient;
    }

    async provideHover(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,    
    ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    
        if (!this.languageClient.isReady) return;
        
        this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        const response = await this.languageClient.getQuickInfo(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        );

        if (response.result && response.result.displayParts) {
            const hover: monaco.languages.Hover = {
                contents: [{value: ts.displayPartsToString(response.result.displayParts)}],
            };
			console.log("Returning hover", hover);
            return hover;
        }
		console.log("Returning hover undefined");
        return undefined;
    }
}
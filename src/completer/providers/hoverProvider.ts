import "../../types/monaco";
import * as ts from 'typescript';
import {LanguageClient} from "../../types/language-client";

export class HoverProvider implements monaco.languages.HoverProvider {

    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    async provideHover(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,    
    ): monaco.ProviderResult<monaco.languages.Hover> {

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
                contents: [ts.displayPartsToString(response.result.displayParts)],
            };
            return hover;
        }
        return undefined;
    }
}
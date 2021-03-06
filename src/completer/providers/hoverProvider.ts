import * as ts from 'typescript';
import { LanguageClient } from "../../../lib/LanguageClient";
import {join} from 'fs';

export class HoverProvider implements monaco.languages.HoverProvider {

    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    async provideHover(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,
        // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.Hover> {

        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        
        const request = this.languageClient.getQuickInfo(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        );

        token.onCancellationRequested(async e => {
            await request.cancel();
        });

        const response = await request.wait();

        if (response.result && response.result.displayParts) {

            const parts = [];
            const displayParts = '```typescript\n' +
                ts.displayPartsToString(response.result.displayParts) + '\n' +
                '```\n';
            parts.push({ value: displayParts });

            if (response.result.documentation) {
                const text = ts.displayPartsToString(response.result.documentation);

                parts.push({ value: text });
            }

            const hover: monaco.languages.Hover = {
                contents: parts,
                range: this.getRange(model, position),
            };
            return hover;
        }
        return undefined;
    }

    private getRange(model: monaco.editor.ITextModel, position: monaco.Position) {
        var word = model.getWordUntilPosition(position);
        return new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
    }
}
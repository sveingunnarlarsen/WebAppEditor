import * as ts from 'typescript';
import { LanguageClient } from "../../../lib/LanguageClient";
import { spanToRange } from "../utils";

export class DocumentFormattingEditorProvider implements monaco.languages.DocumentFormattingEditProvider {

    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    async provideDocumentFormattingEdits(
        model: monaco.editor.ITextModel,
        options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken,
        // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

        console.log("Formatting options: ", options);

        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        const request = this.languageClient.getFormattingEdits(
            model.uri.path,
            options.insertSpaces,
            options.tabSize
        );

        token.onCancellationRequested(async e => {
            await request.cancel();
        })

        const response = await request.wait();

        if (!response.result) return;

        const textEdits = response.result.map<monaco.languages.TextEdit>(e => ({
            text: e.newText,
            range: spanToRange(e.span, model.uri),
        }));

        return textEdits;
    }
}
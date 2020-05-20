import "../../types/monaco";
import * as ts from 'typescript';
import {LanguageClient as LanguageClientType} from "../../types/language-client";
import {spanToRange} from "../utils";

export class DocumentFormattingEditorProvider implements monaco.languages.DocumentFormattingEditProvider {

    private languageClient: LanguageClientType;

    constructor(languageClient: LanguageClientType) {
        this.languageClient = languageClient;
    }

    async provideDocumentFormattingEdits(
        model: monaco.editor.ITextModel,
        options: monaco.languages.FormattingOptions,
        token: monaco.CancellationToken,
    // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {        
        
        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        const response = await this.languageClient.getFormattingEdits(
            model.uri.path,
            options.insertSpaces,
            options.tabSize
        );

        if (!response.result) return;

        const textEdits = response.result.map<monaco.languages.TextEdit>(e => ({
            newText: e.newText,
            range: spanToRange(e.span, model.uri),
        }));

        return textEdits;
    }
}
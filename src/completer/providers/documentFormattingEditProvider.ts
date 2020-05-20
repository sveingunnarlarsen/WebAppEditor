import "../../types/monaco";
import * as ts from 'typescript';
import {LanguageClient as LanguageClientType} from "../../types/language-client";

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
        return undefined;
    }
}
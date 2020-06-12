import * as ts from 'typescript';
import { getFileByPath } from "../../store/utils";
import { LanguageClient } from "../../../lib/LanguageClient";
import { spanToRange } from "../utils";

export class ReferenceProvider implements monaco.languages.ReferenceProvider {

    private languageClient: LanguageClient;

    constructor(languageClient) {
        this.languageClient = languageClient;
    }

    async provideReferences(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.ReferenceContext,
        token: monaco.CancellationToken,
        // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.Location[]> {

        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        const response = await this.languageClient.findReferences(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        );

        if (response.result) {
            const l = response.result.map<monaco.languages.Location[]>(symbolRef => {
                const references = symbolRef.references.map<monaco.languages.Location>(r => {
                    const uri = monaco.Uri.parse(r.fileName);
                    const range = spanToRange(r.textSpan, uri);
                    return { uri, range };
                });
                return references;
            })
            const references: any[] = [];
            l.forEach(m => references.push(...m));

            return references;
        }
        return undefined;
    }
}
import * as ts from 'typescript';
import { getFileByPath } from "../../store/utils";
import { LanguageClient } from "../../../lib/LanguageClient";
import { spanToRange } from "../utils";

export class DefinitionProvider implements monaco.languages.DefinitionProvider {

    private languageClient: LanguageClient;

    constructor(languageClient) {
        this.languageClient = languageClient;
    }
    async provideDefinition(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,
        // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.Definition | monaco.languages.LocationLink[]> {

        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue()
        );

        const request = this.languageClient.getDefinition(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        );

        token.onCancellationRequested(async e => {
            await request.cancel();
        })

        const response = await request.wait();

        if (response.result) {
            const locations = response.result.map<monaco.languages.Location>(r => {
                const uri = monaco.Uri.parse(r.fileName);
                const range = spanToRange(r.textSpan, uri);
                return { range, uri }
            });
            return locations;
        }
        return undefined;
    }
}
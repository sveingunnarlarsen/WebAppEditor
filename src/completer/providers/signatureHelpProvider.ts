import * as ts from 'typescript';
import "../../types/monaco";
import { LanguageClient } from "../../types/language-client";

export class SignatureHelpProvider implements monaco.languages.SignatureHelpProvider {

    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    async provideSignatureHelp(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        token: monaco.CancellationToken,
        context: monaco.languages.SignatureHelpContext,
        // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {

        if (!this.languageClient.isReady) return;

        await this.languageClient.textDocumentChanged(
            model.uri.path,
            model.getValue(),
        );

        const response = await this.languageClient.getSignatureHelp(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        ).catch(exception => { console.error(exception); throw exception; });

        if (!response) return undefined;

        if (!response.result) {
            return undefined;
        }

        const signatureInformations = response.result.items.map((item): monaco.languages.SignatureInformation => {
            const prefix = ts.displayPartsToString(item.prefixDisplayParts);
            const params = item.parameters.map(p => ts.displayPartsToString(p.displayParts)).join(', ');
            const suffix = ts.displayPartsToString(item.suffixDisplayParts);
            const parameters = item.parameters.map((parameter): monaco.languages.ParameterInformation => ({
                label: ts.displayPartsToString(parameter.displayParts),
                documentation: ts.displayPartsToString(parameter.documentation),
            }));
            return {
                label: prefix + params + suffix,
                documentation: ts.displayPartsToString(item.documentation),
                parameters,
            };
        });



        return {
            value: {
                signatures: signatureInformations,
                activeSignature: response.result.selectedItemIndex,
                activeParameter: response.result.argumentIndex,
            },
            dispose: function() {
                console.log("Dispose called");
            }
        };
    }
}
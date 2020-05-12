import "../../types/monaco";
import * as ts from 'typescript';
import {LanguageClient as LanguageClientType} from "../../types/language-client";

export class DefinitionProvider implements monaco.languages.DefinitionProvider {

    private languageClient: LanguageClientType;
    
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

        const response = await this.languageClient.getDefinition(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        );

        if (response.result) {
            
            const locations = response.result.map<monaco.languages.Location>(r => {
                
            });

            /*
            const locations = response.result.map<vs.Location>(r => {
                const uri = vs.Uri.parse(`memfs://${r.fileName}`);
                const sourceFile = ts.createSourceFile(
                    r.fileName,
                    this.fs.readFile(uri).toString(),
                    ts.ScriptTarget.ES2018,
                );
                const p = ts.getLineAndCharacterOfPosition(sourceFile, r.textSpan.start);

                const range = new vs.Range(p.line, p.character, p.line, p.character + r.textSpan.length);

                return { range, uri } as vs.Location;
            });
            */
            return undefined;
        }
        return undefined;
    }
}
import * as ts from 'typescript';
import {getFileByPath} from "../../store/utils";
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
                const uri = monaco.Uri.parse(r.fileName);
                const fileContent = getFileByPath(r.fileName).content;
                const sourceFile = ts.createSourceFile(r.fileName, fileContent, ts.ScriptTarget.ES2018);
                const p = ts.getLineAndCharacterOfPosition(sourceFile, r.textSpan.start);
                const range = new monaco.Range(p.line + 1, p.character + 1, p.line + 1, (p.character + r.textSpan.length) + 1);
                return { range, uri }
            });
            return locations;
        }
        return undefined;
    }
}
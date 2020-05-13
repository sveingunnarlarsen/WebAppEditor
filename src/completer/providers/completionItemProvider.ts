import "../../types/monaco";
import * as pather from 'path';
import * as ts from 'typescript';
import {LanguageClient as LanguageClientType} from "../../types/language-client";

export class CompletionItemProvider implements monaco.languages.CompletionItemProvider {

    private languageClient: LanguageClientType;
    
    constructor(languageClient) {
        this.languageClient = languageClient;
    }

    async provideCompletionItems(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken,        
    // @ts-ignore
    ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        
        if (!this.languageClient.isReady) return;
        
		await this.languageClient.textDocumentChanged(
			model.uri.path,
			model.getValue()
		);

        const list = await this.languageClient.getCompletions(
            model.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        ).catch(exception => { console.error(exception); throw exception; });

        if (!list.result) {
            console.log('Result not found');
            throw new Error("Result not found!");
        }

		var word = model.getWordUntilPosition(position);

        const suggestions = list.result.map(item => new MyCompletionItem(
            item.name,
            this.lookupCompletionItemKind(item.kind),
            this.determineInsertText(item.name),            
            item.sortText,
            this.getRange(model, position),
            model,
            position,
        ));

		return {suggestions}
    }

    private getRange(model: monaco.editor.ITextModel, position: monaco.Position) : monaco.Range {
        var word = model.getWordUntilPosition(position);
        return new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
    }

    private determineInsertText(path: string) : string {
        const ext = pather.extname(path);
        // TODO: This should probably be a configurable option
        const extensionsToRemove = ['.js', '.ts', '.jsx', '.tsx'];
        const result = pather.basename(path, extensionsToRemove.includes(ext) ? ext : undefined);
        return result;
    }

    async resolveCompletionItem(        
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        item: monaco.languages.CompletionItem,
        token: monaco.CancellationToken,
    // @ts-ignore
    ): monaco.ProviderResult<moaco.languages.CompletionItem> {    
        try {
            if (!(item instanceof MyCompletionItem)) {                
                return item;
            }

            const response = await this.languageClient.getCompletionEntryDetails(
                item.model.uri.path,
                item.position.lineNumber - 1,
                item.label,
                item.position.column - 1,
            );

            if (response.result) {
                const result = response.result;
                item.detail = ts.displayPartsToString(result.displayParts);
                item.documentation = ts.displayPartsToString(result.documentation);
                return item;
            }
        } catch (e) {
            console.log("Error resolving completion item", e);
        }
        return item;
    }

    private lookupCompletionItemKind(kind: ts.ScriptElementKind): monaco.languages.CompletionItemKind {
        switch (kind) {
            case ts.ScriptElementKind.directory: return monaco.languages.CompletionItemKind.Folder;
            case ts.ScriptElementKind.externalModuleName: return monaco.languages.CompletionItemKind.Module;
            case ts.ScriptElementKind.scriptElement: return monaco.languages.CompletionItemKind.File;
            case ts.ScriptElementKind.interfaceElement: return monaco.languages.CompletionItemKind.Interface;
            case ts.ScriptElementKind.constElement: return monaco.languages.CompletionItemKind.Constant;
            case ts.ScriptElementKind.functionElement: return monaco.languages.CompletionItemKind.Function;
            case ts.ScriptElementKind.keyword: return monaco.languages.CompletionItemKind.Keyword;
            case ts.ScriptElementKind.enumElement: return monaco.languages.CompletionItemKind.Enum;
            case ts.ScriptElementKind.enumMemberElement: return monaco.languages.CompletionItemKind.EnumMember;
            case ts.ScriptElementKind.moduleElement: return monaco.languages.CompletionItemKind.Module;
            case ts.ScriptElementKind.variableElement: return monaco.languages.CompletionItemKind.Variable;
            case ts.ScriptElementKind.classElement: return monaco.languages.CompletionItemKind.Class;
            case ts.ScriptElementKind.constructSignatureElement: return monaco.languages.CompletionItemKind.Constructor;
            case ts.ScriptElementKind.typeParameterElement: return monaco.languages.CompletionItemKind.TypeParameter;
            case ts.ScriptElementKind.alias: return monaco.languages.CompletionItemKind.Variable;
            case ts.ScriptElementKind.memberGetAccessorElement:
            case ts.ScriptElementKind.memberSetAccessorElement:
            case ts.ScriptElementKind.memberFunctionElement: return monaco.languages.CompletionItemKind.Method;
            case ts.ScriptElementKind.memberVariableElement: return monaco.languages.CompletionItemKind.Variable;
        }
        return monaco.languages.CompletionItemKind.Property;
    }

}

class MyCompletionItem implements monaco.languages.CompletionItem {
    label: string;
    kind: monaco.languages.CompletionItemKind;
    insertText: string;
    sortText: string;
    range: monaco.IRange;
    model: monaco.editor.ITextModel;
    position: monaco.Position;
    detail: string;
    documentation: string;
    constructor(
        label: string,
        kind: monaco.languages.CompletionItemKind,
        insertText: string,
        sortText: string,
        range: monaco.IRange,
        model: monaco.editor.ITextModel,
        position: monaco.Position,
    ) {
        this.label = label;
        this.kind = kind;                
        this.insertText = insertText;
        this.sortText = sortText;
        this.range = range;
        this.model = model;
        this.position = position;        
    }
}
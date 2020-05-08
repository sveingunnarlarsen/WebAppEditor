//import { LanguageClient } from '../language-client/src/language-client';

import * as net from 'net';
import * as pather from 'path';
import * as ts from 'typescript';
import * as monaco from "../../types/monaco.d.ts";
//import {LanguageClient} from "../../types/language-client.d.ts";

console.log(monaco);

export class CompletionItemProvider {

    private languageClient;

    constructor(languageClient) {
        this.languageClient = languageClient;
    }

    async provideCompletionItems(
        document: monaco.ITextModel,
        position: monaco.Position,
        context: monaco.CompletionContext,
        token: monaco.CancellationToken,    
    ): monaco.ProverResult<monaco.CompletionList> {

        if (!this.languageClient.isReady) return;

        //if (document.isDirty) {
            this.languageClient.textDocumentChanged(
                document.uri.path,
                document.getValue()
            );
        //}

        const list = await this.languageClient.getCompletions(
            document.uri.path,
            position.lineNumber - 1,
            position.column - 1,
        ).catch(exception => { console.error(exception); throw exception; });

        if (!list.result) {
            console.log('Result not found');
            throw new Error("Result not found!");
        }

        const completionItems = list.result
            .map<monaco.CompletionItem>((item) => new MyCompletionItem(
                item.name,
                1,//this.lookupCompletionItemKind(item.kind),
                this.determineInsertText(item.name),
                item.sortText,
                document,
                position
            ));

		console.log("completion items: ", completionItems);
        return completionItems;

    }

    private determineInsertText(path: string) {
        const ext = pather.extname(path);
        // TODO: This should probably be a configurable option
        const extensionsToRemove = ['.js', '.ts', '.jsx', '.tsx'];
        const result = pather.basename(path, extensionsToRemove.includes(ext) ? ext : undefined);
        return result;
    }

    /*
    public async resolveCompletionItem?(
        item: monaco.CompletionItem,
        token: monaco.CancellationToken
    ): Promise<vs.ProviderResult<vs.CompletionItem>> {

        if (!(item instanceof MyCompletionItem)) {
            return undefined;
        }

        const response = await this.languageClient.getCompletionEntryDetails(
            item.document.fileName,
            item.position.line,
            item.label,
            item.position.character,
        );

        if (response.result) {
            const result = response.result;
            item.detail = ts.displayPartsToString(result.displayParts);
            item.documentation = ts.displayPartsToString(result.documentation);
            return item;
        }

        return undefined;
    }
    */

    private lookupCompletionItemKind(kind: ts.ScriptElementKind): monaco.CompletionItemKind {
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
        return monaco.CompletionItemKind.Property;
    }

}

class MyCompletionItem {
    constructor(
        label: string,
        kind: monaco.CompletionItemKind,
        insertText: string,
        sortText: string,
        public readonly document: monaco.ITextModel,
        public readonly position: monaco.Position,
    ) {
        //super(label, kind);
        this.insertText = insertText;
        this.sortText = sortText;
    }
}
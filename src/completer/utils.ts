import * as ts from 'typescript';
import { getFileByPath } from "../store/utils";

export function spanToRange(span: ts.TextSpan, uri: monaco.Uri) {
    const file = getFileByPath(uri.path);
    const sourceFile = ts.createSourceFile(uri.path, file.content, ts.ScriptTarget.ES2018);
    const p = ts.getLineAndCharacterOfPosition(sourceFile, span.start);
    return new monaco.Range(p.line + 1, p.character + 1, p.line + 1, (p.character + span.length) + 1);    
}
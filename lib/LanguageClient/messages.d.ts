import * as ts from 'typescript';
export declare enum FileType {
    File = "file",
    Directory = "folder"
}
export interface Diagnostic {
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    code: number;
    source: string;
}
export declare enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3
}
export interface Position {
    line: number;
    character: number;
}
export interface Range {
    start: Position;
    end: Position;
}
export interface Message {
    jsonrpc: string;
}
export interface NotificationMessage<Params = any> extends Message {
    method: string;
    params?: Params;
}
export interface RequestMessage<Params = any> extends Message {
    id: number | string;
    method: string;
    params?: Params;
}
export interface ResponseMessage<Result = any> extends Message {
    id: number | string | null;
    /**
     * The result of a request. This can be omitted in
     * the case of an error.
     */
    result?: Result;
    error?: ResponseError;
}
export declare type Document = string;
/******************************** */
/******************************** */
export interface TextDocumentChangedParams {
    path: string;
    content: string;
}
export interface TextDocumentDeletedParams {
    path: string;
}
export interface TextDocumentCreatedParams {
    path: string;
    /**
     * The content of the document,
     * Can be null but will then be treated as empty string
     */
    content?: string;
    fileType: FileType;
}
export interface TextDocumentOpenedParams {
    path: string;
}
export interface PublishDiagnosticsParams {
    path: string;
    diagnostics: Diagnostic[];
}
export interface TerminateParams {
}
export interface CancelRequestParams {
    id: string | number;
}
/******************************** */
/******************************** */
export interface InitializeParams {
    projectId: string;
}
export interface GetCompletionsParams {
    path: string;
    line: number;
    character: number;
}
export interface FindReferencesParams {
    path: string;
    line: number;
    character: number;
}
export interface GetQuickInfoParams {
    path: string;
    line: number;
    character: number;
}
export interface GetCompletionEntryDetailsParams {
    path: string;
    line: number;
    character: number;
    symbol: string;
}
export interface GetSignatureHelpParams {
    path: string;
    line: number;
    character: number;
}
export interface GetDiagnosticsParams {
    path: string;
}
export interface GetDefinitionParams {
    path: string;
    line: number;
    character: number;
}
export interface GetFormattingEditsParams {
    path: string;
    insertSpaces: boolean;
    tabSize: number;
}
/************************* */
/************************* */
export interface ResponseError<D = any> {
    code: number;
    message: string;
    /**
     * A Primitive or Structured value that contains additional
     * information about the error. Can be omitted.
     */
    data?: D;
}
export declare type InitializeResult = null;
export declare type GetCompletionsResult = ts.CompletionEntry[];
export declare type FindReferencesResult = ts.ReferencedSymbol[];
export declare type GetQuickInfoResult = ts.QuickInfo;
export declare type GetCompletionEntryDetailsResult = ts.CompletionEntryDetails;
export declare type GetSignatureHelpResult = ts.SignatureHelpItems;
export declare type GetDefinitionResult = ts.DefinitionInfo[];
export declare type GetFormattingEditsResult = ts.TextChange[];

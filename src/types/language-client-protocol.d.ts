import * as ts from 'typescript';
export declare const enum FileType {
    File = 0,
    Directory = 1
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
export interface TextDocumentChangedParams extends BaseParams {
    path: string;
    content: string;
}
export interface TextDocumentDeletedParams extends BaseParams {
    path: string;
}
export interface TextDocumentCreatedParams extends BaseParams {
    path: string;
    /**
     * The content of the document,
     * Can be null but will then be treated as empty string
     */
    content?: string;
    fileType: FileType;
}
export interface TextDocumentOpenedParams extends BaseParams {
    path: string;
}
export interface PublishDiagnosticsParams extends BaseParams {
    path: string;
    diagnostics: Diagnostic[];
}
export interface TerminateParams extends BaseParams {
}
/******************************** */
/******************************** */
export interface BaseParams {
    projectId: string;
}
export interface InitializeParams extends BaseParams {
}
export interface GetCompletionsParams extends BaseParams {
    path: string;
    line: number;
    character: number;
}
export interface FindReferencesParams extends BaseParams {
    path: string;
    line: number;
    character: number;
}
export interface GetQuickInfoParams extends BaseParams {
    path: string;
    line: number;
    character: number;
}
export interface GetCompletionEntryDetailsParams extends BaseParams {
    path: string;
    line: number;
    character: number;
    symbol: string;
}
export interface GetSignatureHelpParams extends BaseParams {
    path: string;
    line: number;
    character: number;
}
export interface GetDiagnosticsParams extends BaseParams {
    path: string;
}
export interface GetDefinitionParams extends BaseParams {
    path: string;
    line: number;
    character: number;
}
export interface GetFormattingEditsParams extends BaseParams {
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

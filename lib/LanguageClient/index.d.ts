import * as protocol from './messages';
export declare enum ClientEvent {
    Connected = "connected",
    Disconnected = "disconnected",
    Reconnected = "reconnected",
    Errd = "errd",
    PublishDiagnostics = "publishDiagnostics"
}
export interface ConnectResult {
    success: boolean;
    error?: any;
}
export interface Cancellable<T> {
    cancel: () => Promise<void>;
    wait: () => Promise<T>;
}
/**
 * Operates on one project at a time.
 */
export declare class LanguageClient {
    private _msgCounter;
    private _socket;
    private _projectId;
    private _eventEmitter;
    private _cookie;
    private _responseQueue;
    private _projectInitialized;
    constructor();
    /**
     * Send a notification to the server
     * @param method Takes a NotificationMethod
     * @param params The parameters to send
     */
    private _notify;
    /**
     * Send a request to the language-server
     * @param method What type of action the language-server should perform
     * @param params Associated parameters to the method
     *
     */
    private _execute;
    private _executeCancellable;
    private _cancel;
    on(event: ClientEvent.Connected, listener: () => void): void;
    on(event: ClientEvent.Disconnected, listener: (event: {
        code: number;
        reason: string;
        wasClean: boolean;
    }) => void): void;
    on(event: ClientEvent.Reconnected, listener: () => void): void;
    on(event: ClientEvent.Errd, listener: (error: protocol.ResponseError) => void): void;
    on(event: ClientEvent.PublishDiagnostics, listener: (result: protocol.PublishDiagnosticsParams) => void): void;
    /**
     * Set the authorization cookie to be used to authenticate.
     * @param cookie The cookie to use
     */
    setCookie(cookie: string): void;
    /**
     * Check if the client is connected to a server
     *
     */
    readonly isConnected: boolean;
    /**
     * Return the id of the currently "loaded" project.
     * Undefined if no project has been loaded.
     */
    readonly isProjectInitialized: boolean;
    /**
     * Check if the languageClient is connected and a project is initialized
     */
    readonly isReady: boolean;
    /**
     * Connect to a remote language-server
     * @param uri The websocket uri to connect to, eg 'wss://localhost:1339'
     */
    connect(uri: string, cookie?: string): Promise<ConnectResult>;
    /**
     * Close the underlying socket
     */
    close(): Promise<void>;
    /**
     * Initialize the specificed project on the server.
     * @param projectId The projectId to initialize, automatically
     * uses this as the projectId for future calls
     */
    initialize(projectId: string): Promise<protocol.ResponseMessage<protocol.InitializeResult>>;
    /**
     * Signal the server to un-initalize the project.
     * Any further calls to the project will result in a
     * Not-initialized-like response.
     *
     * Also uninitializes the languageClient, requiering initialize to be run again.
     */
    terminate(): Promise<void>;
    /**
     * Notify the language-server about a file change
     * This will also update the file on the server
     * @param path Path to the file
     * @param content The file-content
     *
     */
    textDocumentChanged(path: string, content: string): Promise<void>;
    textDocumentPartiallyChanged(path: string, newText: string, start: number, end: number): Promise<void>;
    /**
     * Notify the server that a resource was deleted
     * @param path The path to the resouce that was deleted
     *
     */
    textDocumentDeleted(path: string): Promise<void>;
    /**
     * Notify the server that a file or directory has been created
     * @param path Path to the "File"
     * @param fileType Whether this is a file or directory
     * @param content The content if fileType is file
     *
     */
    textDocumentCreated(path: string, fileType: protocol.FileType, content: string): Promise<void>;
    /**
     * Notify the server about a file being opened, usually
     * resulting in the server sending a PublishDiagnostics notification
     * @param path Path
     */
    textDocumentOpened(path: string): Promise<void>;
    /**
     * Request a list of possible completions for
     * the specified line and character.
     * @param path Path to the file
     * @param line 0-based linenumber
     * @param character 0-based character index
     */
    getCompletions(path: string, line: number, character: number): Cancellable<protocol.ResponseMessage<protocol.GetCompletionsResult>>;
    /**
     * Request a list of references for
     * the symbol specified at line and character.
     * @param path Path to the file
     * @param line 0-based linenumber
     * @param character 0-based character index
     */
    findReferences(path: string, line: number, character: number): Cancellable<protocol.ResponseMessage<protocol.FindReferencesResult>>;
    /**
     * Request information at the specified
     * line and character.
     * @param path Path to the file
     * @param line 0-based linenumber
     * @param character 0-based character index
     */
    getQuickInfo(path: string, line: number, character: number): Cancellable<protocol.ResponseMessage<protocol.GetQuickInfoResult>>;
    /**
     * Request signature information at the specified cursor location
     * @param path Path to the file
     * @param line 0-based line number
     * @param character 0-based character index
     */
    getSignatureHelp(path: string, line: number, character: number): Cancellable<protocol.ResponseMessage<protocol.GetSignatureHelpResult>>;
    getCompletionEntryDetails(path: string, line: number, symbol: string, character: number): Cancellable<protocol.ResponseMessage<protocol.GetCompletionEntryDetailsResult>>;
    getDefinition(path: string, line: number, character: number): Cancellable<protocol.ResponseMessage<protocol.GetDefinitionResult>>;
    getFormattingEdits(path: string, insertSpaces: boolean, tabSize: number): Cancellable<protocol.ResponseMessage<protocol.GetFormattingEditsResult>>;
}

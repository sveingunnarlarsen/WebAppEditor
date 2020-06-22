import { loadWASM } from 'onigasm'; // peer dependency of 'monaco-textmate'
import { Registry, INITIAL, StackElement } from 'monaco-textmate'; // peer dependency
import monaco from "./monaco";

let registry;

export async function initTextMate() {
    await loadWASM(`${location.origin}/public/tokenization/onigasm.wasm`);

    registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            if (scopeName === "source.ts") {
                return {
                    format: 'json',
                    content: await (await fetch(`${location.origin}/public/tokenization/TypeScript.tmLanguage.json`)).text()
                }
            }
            if (scopeName === "source.tsx") {
                return {
                    format: 'json',
                    content: await (await fetch(`${location.origin}/public/tokenization/TypeScriptReact.tmLanguage.json`)).text()
                }
            }
        }
    });

    await registry.loadGrammar("source.ts");
    await registry.loadGrammar("source.tsx");

    console.log("Onigasm loaded");
}

let tokensProviderSet: boolean = false;
let editorRef;

export async function setTokensProvider(editor: monaco.editor.ICodeEditor) {

    editorRef = editor;
    if (tokensProviderSet) return;

    console.log("Creating token providers");

    const grammarTypeScript = await registry.loadGrammar("source.ts");
    const grammarTypeScriptReact = await registry.loadGrammar("source.tsx");

    monaco.languages.setTokensProvider("typescript", {
        getInitialState: () => new TokenizerState(INITIAL),
        tokenize: (line: string, state: TokenizerState) => {
            const res = grammarTypeScript.tokenizeLine(line, state.ruleStack)
            return {
                endState: new TokenizerState(res.ruleStack),
                tokens: res.tokens.map(token => ({
                    ...token,
                    // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
                    scopes: TMToMonacoToken(token.scopes),
                })),
            }
        }
    });
    
    /*
    monaco.languages.setTokensProvider("typescript_react", {
        getInitialState: () => new TokenizerState(INITIAL),
        tokenize: (line: string, state: TokenizerState) => {
            const res = grammarTypeScriptReact.tokenizeLine(line, state.ruleStack)
            return {
                endState: new TokenizerState(res.ruleStack),
                tokens: res.tokens.map(token => ({
                    ...token,
                    // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
                    scopes: TMToMonacoToken(token.scopes),
                })),
            }
        }
    });
    */
    tokensProviderSet = true;
}

class TokenizerState implements monaco.languages.IState {

    constructor(
        private _ruleStack: StackElement
    ) { }

    public get ruleStack(): StackElement {
        return this._ruleStack
    }

    public clone(): TokenizerState {
        return new TokenizerState(this._ruleStack);
    }

    public equals(other: monaco.languages.IState): boolean {
        if (!other ||
            !(other instanceof TokenizerState) ||
            other !== this ||
            other._ruleStack !== this._ruleStack
        ) {
            return false;
        }
        return true;
    }
}

const TMToMonacoToken = (scopes: string[]) => {
    let scopeName = "";
    // get the scope name. Example: cpp , java, haskell
    for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
        const char = scopes[0][i];
        if (char === ".") {
            break;
        }
        scopeName = char + scopeName;
    }

    // iterate through all scopes from last to first
    for (let i = scopes.length - 1; i >= 0; i -= 1) {
        const scope = scopes[i];

        for (let i = scope.length - 1; i >= 0; i -= 1) {
            const char = scope[i];
            if (char === ".") {
                const token = scope.slice(0, i);
                if (
                    editorRef['_themeService'].getTheme()._tokenTheme._match(token + "." + scopeName)._foreground >
                    1
                ) {
                    return token + "." + scopeName;
                }
                if (editorRef['_themeService'].getTheme()._tokenTheme._match(token)._foreground > 1) {
                    return token;
                }
            }
        }
    }

    return "";
};
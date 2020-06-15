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

export const themeDark = {
    "inherit": true,
    "base": "vs-dark",
    "colors": {
        "activityBarBadge.background": "#007acc",
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editor.selectionHighlightBackground": "#add6ff26",
        "editorIndentGuide.activeBackground": "#707070",
        "editorIndentGuide.background": "#404040",
        "input.placeholderForeground": "#a6a6a6",
        "list.dropBackground": "#383b3d",
        "menu.background": "#252526",
        "menu.foreground": "#cccccc",
        "settings.numberInputBackground": "#292929",
        "settings.textInputBackground": "#292929",
        "sideBarSectionHeader.background": "#00000000",
        "sideBarSectionHeader.border": "#cccccc33",
        "sideBarTitle.foreground": "#bbbbbb",
        "statusBarItem.remoteBackground": "#16825d",
        "statusBarItem.remoteForeground": "#ffffff"
    },
    "rules": [
        {
            "foreground": "#D4D4D4",
            "token": "meta.embedded"
        },
        {
            "foreground": "#D4D4D4",
            "token": "source.groovy.embedded"
        },
        {
            "fontStyle": "italic",
            "token": "emphasis"
        },
        {
            "fontStyle": "bold",
            "token": "strong"
        },
        {
            "foreground": "#000080",
            "token": "header"
        },
        {
            "foreground": "#6A9955",
            "token": "comment"
        },
        {
            "foreground": "#569CD6",
            "token": "constant.language"
        },
        {
            "foreground": "#B5CEA8",
            "token": "constant.numeric"
        },
        {
            "foreground": "#B5CEA8",
            "token": "entity.name.operator.custom-literal.number"
        },
        {
            "foreground": "#B5CEA8",
            "token": "variable.other.enummember"
        },
        {
            "foreground": "#B5CEA8",
            "token": "keyword.operator.plus.exponent"
        },
        {
            "foreground": "#B5CEA8",
            "token": "keyword.operator.minus.exponent"
        },
        {
            "foreground": "#646695",
            "token": "constant.regexp"
        },
        {
            "foreground": "#569CD6",
            "token": "entity.name.tag"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.name.tag.css"
        },
        {
            "foreground": "#9CDCFE",
            "token": "entity.other.attribute-name"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.class.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.class.mixin.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.id.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.parent-selector.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.pseudo-class.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.pseudo-element.css"
        },
        {
            "foreground": "#D7BA7D",
            "token": "source.css.less entity.other.attribute-name.id"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.attribute.scss"
        },
        {
            "foreground": "#D7BA7D",
            "token": "entity.other.attribute-name.scss"
        },
        {
            "foreground": "#F44747",
            "token": "invalid"
        },
        {
            "fontStyle": "underline",
            "token": "markup.underline"
        },
        {
            "foreground": "#569CD6",
            "fontStyle": "bold",
            "token": "markup.bold"
        },
        {
            "foreground": "#569CD6",
            "fontStyle": "bold",
            "token": "markup.heading"
        },
        {
            "fontStyle": "italic",
            "token": "markup.italic"
        },
        {
            "foreground": "#B5CEA8",
            "token": "markup.inserted"
        },
        {
            "foreground": "#CE9178",
            "token": "markup.deleted"
        },
        {
            "foreground": "#569CD6",
            "token": "markup.changed"
        },
        {
            "foreground": "#6A9955",
            "token": "punctuation.definition.quote.begin.markdown"
        },
        {
            "foreground": "#6796E6",
            "token": "punctuation.definition.list.begin.markdown"
        },
        {
            "foreground": "#CE9178",
            "token": "markup.inline.raw"
        },
        {
            "foreground": "#808080",
            "token": "punctuation.definition.tag"
        },
        {
            "foreground": "#569CD6",
            "token": "meta.preprocessor"
        },
        {
            "foreground": "#569CD6",
            "token": "entity.name.function.preprocessor"
        },
        {
            "foreground": "#CE9178",
            "token": "meta.preprocessor.string"
        },
        {
            "foreground": "#B5CEA8",
            "token": "meta.preprocessor.numeric"
        },
        {
            "foreground": "#9CDCFE",
            "token": "meta.structure.dictionary.key.python"
        },
        {
            "foreground": "#569CD6",
            "token": "meta.diff.header"
        },
        {
            "foreground": "#569CD6",
            "token": "storage"
        },
        {
            "foreground": "#569CD6",
            "token": "storage.type"
        },
        {
            "foreground": "#569CD6",
            "token": "storage.modifier"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.noexcept"
        },
        {
            "foreground": "#CE9178",
            "token": "string"
        },
        {
            "foreground": "#CE9178",
            "token": "entity.name.operator.custom-literal.string"
        },
        {
            "foreground": "#CE9178",
            "token": "meta.embedded.assembly"
        },
        {
            "foreground": "#CE9178",
            "token": "string.tag"
        },
        {
            "foreground": "#CE9178",
            "token": "string.value"
        },
        {
            "foreground": "#D16969",
            "token": "string.regexp"
        },
        {
            "foreground": "#569CD6",
            "token": "punctuation.definition.template-expression.begin"
        },
        {
            "foreground": "#569CD6",
            "token": "punctuation.definition.template-expression.end"
        },
        {
            "foreground": "#569CD6",
            "token": "punctuation.section.embedded"
        },
        {
            "foreground": "#D4D4D4",
            "token": "meta.template.expression"
        },
        {
            "foreground": "#9CDCFE",
            "token": "support.type.vendored.property-name"
        },
        {
            "foreground": "#9CDCFE",
            "token": "support.type.property-name"
        },
        {
            "foreground": "#9CDCFE",
            "token": "variable.css"
        },
        {
            "foreground": "#9CDCFE",
            "token": "variable.scss"
        },
        {
            "foreground": "#9CDCFE",
            "token": "variable.other.less"
        },
        {
            "foreground": "#9CDCFE",
            "token": "source.coffee.embedded"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.control"
        },
        {
            "foreground": "#D4D4D4",
            "token": "keyword.operator"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.new"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.expression"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.cast"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.sizeof"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.alignof"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.typeid"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.alignas"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.instanceof"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.logical.python"
        },
        {
            "foreground": "#569CD6",
            "token": "keyword.operator.wordlike"
        },
        {
            "foreground": "#B5CEA8",
            "token": "keyword.other.unit"
        },
        {
            "foreground": "#569CD6",
            "token": "punctuation.section.embedded.begin.php"
        },
        {
            "foreground": "#569CD6",
            "token": "punctuation.section.embedded.end.php"
        },
        {
            "foreground": "#9CDCFE",
            "token": "support.function.git-rebase"
        },
        {
            "foreground": "#B5CEA8",
            "token": "constant.sha.git-rebase"
        },
        {
            "foreground": "#D4D4D4",
            "token": "storage.modifier.import.java"
        },
        {
            "foreground": "#D4D4D4",
            "token": "variable.language.wildcard.java"
        },
        {
            "foreground": "#D4D4D4",
            "token": "storage.modifier.package.java"
        },
        {
            "foreground": "#569CD6",
            "token": "variable.language"
        },
        {
            "foreground": "#DCDCAA",
            "token": "entity.name.function"
        },
        {
            "foreground": "#DCDCAA",
            "token": "support.function"
        },
        {
            "foreground": "#DCDCAA",
            "token": "support.constant.handlebars"
        },
        {
            "foreground": "#DCDCAA",
            "token": "source.powershell variable.other.member"
        },
        {
            "foreground": "#DCDCAA",
            "token": "entity.name.operator.custom-literal"
        },
        {
            "foreground": "#4EC9B0",
            "token": "meta.return-type"
        },
        {
            "foreground": "#4EC9B0",
            "token": "support.class"
        },
        {
            "foreground": "#4EC9B0",
            "token": "support.type"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.name.type"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.name.namespace"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.other.attribute"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.name.scope-resolution"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.name.class"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.numeric.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.byte.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.boolean.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.string.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.uintptr.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.error.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.rune.go"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.cs"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.generic.cs"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.modifier.cs"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.variable.cs"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.annotation.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.generic.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.object.array.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.primitive.array.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.primitive.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.token.java"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.annotation.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.parameters.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.generic.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.object.array.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.primitive.array.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "storage.type.primitive.groovy"
        },
        {
            "foreground": "#4EC9B0",
            "token": "meta.type.cast.expr"
        },
        {
            "foreground": "#4EC9B0",
            "token": "meta.type.new.expr"
        },
        {
            "foreground": "#4EC9B0",
            "token": "support.constant.math"
        },
        {
            "foreground": "#4EC9B0",
            "token": "support.constant.dom"
        },
        {
            "foreground": "#4EC9B0",
            "token": "support.constant.json"
        },
        {
            "foreground": "#4EC9B0",
            "token": "entity.other.inherited-class"
        },
        {
            "foreground": "#C586C0",
            "token": "keyword.control"
        },
        {
            "foreground": "#C586C0",
            "token": "source.cpp keyword.operator.new"
        },
        {
            "foreground": "#C586C0",
            "token": "keyword.operator.delete"
        },
        {
            "foreground": "#C586C0",
            "token": "keyword.other.using"
        },
        {
            "foreground": "#C586C0",
            "token": "keyword.other.operator"
        },
        {
            "foreground": "#C586C0",
            "token": "entity.name.operator"
        },
        {
            "foreground": "#9CDCFE",
            "token": "variable"
        },
        {
            "foreground": "#9CDCFE",
            "token": "meta.definition.variable.name"
        },
        {
            "foreground": "#9CDCFE",
            "token": "support.variable"
        },
        {
            "foreground": "#9CDCFE",
            "token": "entity.name.variable"
        },
        {
            "foreground": "#51B6C4",
            "token": "variable.other.constant"
        },
        {
            "foreground": "#51B6C4",
            "token": "variable.other.enummember"
        },
        {
            "foreground": "#9CDCFE",
            "token": "meta.object-literal.key"
        },
        {
            "foreground": "#CE9178",
            "token": "support.constant.property-value"
        },
        {
            "foreground": "#CE9178",
            "token": "support.constant.font-name"
        },
        {
            "foreground": "#CE9178",
            "token": "support.constant.media-type"
        },
        {
            "foreground": "#CE9178",
            "token": "support.constant.media"
        },
        {
            "foreground": "#CE9178",
            "token": "constant.other.color.rgb-value"
        },
        {
            "foreground": "#CE9178",
            "token": "constant.other.rgb-value"
        },
        {
            "foreground": "#CE9178",
            "token": "support.constant.color"
        },
        {
            "foreground": "#CE9178",
            "token": "punctuation.definition.group.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "punctuation.definition.group.assertion.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "punctuation.definition.character-class.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "punctuation.character.set.begin.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "punctuation.character.set.end.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "keyword.operator.negation.regexp"
        },
        {
            "foreground": "#CE9178",
            "token": "support.other.parenthesis.regexp"
        },
        {
            "foreground": "#D16969",
            "token": "constant.character.character-class.regexp"
        },
        {
            "foreground": "#D16969",
            "token": "constant.other.character-class.set.regexp"
        },
        {
            "foreground": "#D16969",
            "token": "constant.other.character-class.regexp"
        },
        {
            "foreground": "#D16969",
            "token": "constant.character.set.regexp"
        },
        {
            "foreground": "#DCDCAA",
            "token": "keyword.operator.or.regexp"
        },
        {
            "foreground": "#DCDCAA",
            "token": "keyword.control.anchor.regexp"
        },
        {
            "foreground": "#D7BA7D",
            "token": "keyword.operator.quantifier.regexp"
        },
        {
            "foreground": "#569CD6",
            "token": "constant.character"
        },
        {
            "foreground": "#D7BA7D",
            "token": "constant.character.escape"
        },
        {
            "foreground": "#C8C8C8",
            "token": "entity.name.label"
        },
        {
            "foreground": "#6796E6",
            "token": "token.info-token"
        },
        {
            "foreground": "#CD9731",
            "token": "token.warn-token"
        },
        {
            "foreground": "#F44747",
            "token": "token.error-token"
        },
        {
            "foreground": "#B267E6",
            "token": "token.debug-token"
        }
    ],
    "encodedTokensColors": []
}
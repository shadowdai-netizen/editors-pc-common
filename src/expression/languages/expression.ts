import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  existLanguage,
  formatInfo,
  formulaEditorSyntax,
  getSuggestions,
  joinKeywords,
  findHoverWord,
  getTokenKeywords,
} from "../utils";

export const name = "expression";
export const register = (monaco: typeof Monaco, options) => {
  let providerHandlers = [];
  if (existLanguage(monaco, name)) {
    providerHandlers = updateProvider(monaco, options, providerHandlers);
    return {
      dispose: () => disposeProvider(providerHandlers),
    };
  }
  monaco.languages.register({ id: name });
  setLanguageConfiguration(monaco);
  providerHandlers = registerProvider(monaco, options);
  return {
    dispose: () => disposeProvider(providerHandlers),
  };
};

const registerProvider = (monaco: typeof Monaco, options) => {
  const handlers = [];
  const { suggestions } = options;
  handlers.push(registerCompletionItemProvider(monaco, suggestions));
  handlers.push(registerHoverProvider(monaco, suggestions));
  return handlers;
};

const updateProvider = (monaco: typeof Monaco, options, providerHandlers) => {
  disposeProvider(providerHandlers);
  return registerProvider(monaco, options);
};

const disposeProvider = (providerHandler = []) => {
  providerHandler.forEach((providerHandler) => {
    providerHandler?.dispose();
  });
};

const setLanguageConfiguration = (monaco: typeof Monaco) => {
  monaco.languages.setLanguageConfiguration(name, {
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
    ],
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
      ["|", "|"]
    ],
  });
};

const registerCompletionItemProvider = (
  monaco: typeof Monaco,
  suggestions: any[] = []
): Monaco.IDisposable => {
  setLanguageTokens(monaco, suggestions);
  return monaco.languages.registerCompletionItemProvider(name, {
    triggerCharacters: [".", "{"],
    provideCompletionItems: function (model, position, context) {
      const word = model
        .getValue()
        .replace(/[\r\n]/g, "")
        .replace(/\{(.*?)\}/g, (match, key) => key.trim());
      const _suggestions = getSuggestions(suggestions, word, context);
      return {
        suggestions: [...(_suggestions || [])].map((item) => {
          return {
            kind: monaco.languages.CompletionItemKind.Variable,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            ...item,
          };
        }),
      };
    },
  });
};

const setLanguageTokens = (monaco: typeof Monaco, suggestions) => {
  const keywords = getTokenKeywords(suggestions);
  monaco.languages.setMonarchTokensProvider(
    name,
    formulaEditorSyntax({ keywords })
  );
};

const registerHoverProvider = (
  monaco: typeof Monaco,
  suggestions: any[] = []
): Monaco.IDisposable => {
  return monaco.languages.registerHoverProvider(name, {
    provideHover: function (model, position, context) {
      const keywords = joinKeywords(monaco, model, position);
      const word = keywords[keywords.length - 1];
      const info = findHoverWord(keywords, suggestions);
      return {
        range: new monaco.Range(
          1,
          1,
          model.getLineCount(),
          model.getLineMaxColumn(model.getLineCount())
        ),
        contents: [
          { value: `**${word}**` },
          { value: formatInfo(info), supportHtml: true, isTrusted: true },
        ],
      };
    },
  });
};

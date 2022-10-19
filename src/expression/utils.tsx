import Monaco from "monaco-editor/esm/vs/editor/editor.api";
export function formulaEditorSyntax(
  { keywords }: any,
  useSemicolons?: boolean
): Monaco.languages.IMonarchLanguage {
  return {
    booleans: ["true", "false"],
    keywords: keywords || [],
    operators: [
      "+",
      "-",
      "*",
      "%",
      "===",
      "!=",
      "==",
      ">",
      ">=",
      "<",
      "<=",
      "&&",
      "||",
      "!",
      ".",
    ],
    hostSymbols: [],
    variables: keywords || [],
    functions: [],

    // Captures blocks of symbols that are checked for being operators later.
    symbols: /[=><!~?:&|+\-*\/\^%@;]+/,

    // C# style strings
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // Record keys must always be plain identifier color.
        [/[a-zA-Z_][\w]*\s*:/, "identifier"],

        // Identifiers and keywords
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              "@functions": "function",
              "@booleans": "boolean",
              "@keywords": "keyword",
              "@hostSymbols": "hostSymbol",
              "@variables": "variable",
              "@default": "identifier",
            },
          },
        ],

        { include: "@whitespace" },

        // Delimiters and operators
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],

        // numbers
        [
          useSemicolons
            ? /\d*\,\d+([eE][\-+]?\d+)?/
            : /\d*\.\d+([eE][\-+]?\d+)?/,
          "number.float",
        ],
        [/\d+/, "number"],

        // delimiter: after number because of .\d floats
        [/[;,.]/, "delimiter"],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        [/'([^'\\]|\\.)*$/, "unicodeIdentifier.invalid"], // non-teminated string
        [
          /'/,
          {
            token: "unicodeIdentifier.quote",
            bracket: "@open",
            next: "@unicodeIdentifier",
          },
        ],

        // Unknown literals (could be unicode names)
        [
          /.\S*/,
          {
            cases: {
              "@hostSymbols": "hostSymbol",
              "@variables": "variable",
              "@default": "identifier",
            },
          },
        ],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"], // nested comment
        ["\\*/", "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      unicodeIdentifier: [
        [/[^\\']+/, "unicodeIdentifier"],
        [/@escapes/, "unicodeIdentifier.escape"],
        [/\\./, "unicodeIdentifier.escape.invalid"],
        [
          /'/,
          { token: "unicodeIdentifier.quote", bracket: "@close", next: "@pop" },
        ],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],
    },
  } as Monaco.languages.IMonarchLanguage;
}

export const formatInfo = (properties) => {
  const type = Object.prototype.toString
    .call(properties)
    .match(/\[object (.*)\]/)[1];
  const ret = [];
  if (type === "Object") {
    for (const [key, value] of Object.entries(properties)) {
      ret.push(
        `<p data-item="row"><div data-item="label">${key}</div> <span data-item="value">${value}</span></p>`
      );
    }
  }
  return ret.join("");
};

export const getSuggestions = (suggestion, word, context) => {
  const triggerCharacter = context.triggerCharacter;
  if (triggerCharacter === "{") {
    return suggestion;
  } else {
    let wordArr = word.trim().split(".");
    if (triggerCharacter === ".") {
      wordArr = wordArr.filter((str) => !!str);
    }
    return findSuggestion(wordArr, suggestion);
  }
};

const findSuggestion = (keywords, suggestions) => {
  let _suggestions = suggestions;
  for (let index = 0; index < keywords.length; index++) {
    const target = _suggestions?.find(({ label }) => label === keywords[index]);
    if (target) {
      //keyword完全匹配
      _suggestions = target.properties;
      if (index === keywords.length - 1) {
        return _suggestions;
      }
    } else {
      if (index === keywords.length - 1) {
        return (
          _suggestions?.filter(({ label }) =>
            label.startsWith(keywords[index])
          ) || []
        );
      } else {
        return [];
      }
    }
  }
};

export const joinKeywords = (monaco, model, position) => {
  const range = new monaco.Range(
    position.lineNumber,
    2,
    position.lineNumber,
    position.column
  );
  const value = model.getValueInRange(range);
  const keywords = value.split(".");
  keywords.pop();
  const word = model.getWordAtPosition(position)?.word;
  if (word) {
    keywords.push(word);
  }
  return keywords;
};

export const findHoverWord = (keywords, suggestions) => {
  let _suggestions = suggestions;
  for (let index = 0; index < keywords.length; index++) {
    const target = _suggestions?.find(({ label }) => label === keywords[index]);
    if (target) {
      _suggestions = target.properties;
      if (index === keywords.length - 1) {
        return target;
      }
    } else {
      return;
    }
  }
};

export const existLanguage = (monaco, name) => {
  if (
    monaco.languages.getLanguages().some((language) => language.id === name)
  ) {
    return true;
  }
  return false;
};

export const getTokenKeywords = (suggestions) => {
  const keywords = [];
  const queue = [];
  suggestions.forEach((suggestion) => {
    queue.push(suggestion);
  });
  while (queue.length) {
    const current = queue.shift();
    if (!keywords.includes(current.label)) {
      keywords.push(...`${current.label}`.split('.'));
    }
    if (current.properties) {
      current.properties.forEach((element) => {
        queue.push(element);
      });
    }
  }
  return keywords;
};
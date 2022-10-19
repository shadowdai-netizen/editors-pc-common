import monaco from 'monaco-editor/esm/vs/editor/editor.api';
/** Name used to represent our language */
export const languageName = 'expression';
export const themeName = 'expression';

/** Creates an entry for our language with the monaco editor */
export function ensureLanguageRegistered(monacoParam: typeof monaco): void {
  if (
    monacoParam.languages
      .getLanguages()
      .some((language) => language.id === languageName)
  ) {
    return;
  }

  monacoParam.languages.register({
    id: languageName
  });
  monacoParam.editor.defineTheme(themeName, {
    base: 'vs',
    inherit: true,
    colors: {},
    rules: [
      { token: 'boolean', foreground: '#795548' },
      { token: 'keyword', foreground: '#B54B8C' },
      { token: 'function', foreground: '#295EA3' },
      { token: 'number', foreground: '#B64900' },
      { token: 'operator', foreground: '#656871' },
      { token: 'hostSymbol', foreground: '#742774', fontStyle: 'italic' },
      { token: 'variable', foreground: '#007C85' }
    ]
  });
  monacoParam.editor.setTheme(themeName);

  // Set language configuration to show matching brackets
  monacoParam.languages.setLanguageConfiguration(languageName, {
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' }
    ],
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ]
  });
  // monacoParam.languages.setMonarchTokensProvider(
  //   languageName,
  //   formulaEditorSyntax({})
  // );
}

function formulaEditorSyntax(
  { keywords }: any,
  useSemicolons?: boolean
): monaco.languages.IMonarchLanguage {
  return {
    booleans: ['true', 'false'],
    keywords: keywords || [],
    operators: [
      '+',
      '-',
      '*',
      '%',
      '===',
      '!=',
      '==',
      '>',
      '>=',
      '<',
      '<=',
      '&&',
      '||',
      '!',
      '.'
    ],
    hostSymbols: [],
    variables: [],
    functions: [],

    // Captures blocks of symbols that are checked for being operators later.
    symbols: /[=><!~?:&|+\-*\/\^%@;]+/,

    // C# style strings
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // Record keys must always be plain identifier color.
        [/[a-zA-Z_][\w]*\s*:/, 'identifier'],

        // Identifiers and keywords
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              '@functions': 'function',
              '@booleans': 'boolean',
              '@keywords': 'keyword',
              '@hostSymbols': 'hostSymbol',
              '@variables': 'variable',
              '@default': 'identifier'
            }
          }
        ],

        { include: '@whitespace' },

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }
        ],

        // numbers
        [
          useSemicolons
            ? /\d*\,\d+([eE][\-+]?\d+)?/
            : /\d*\.\d+([eE][\-+]?\d+)?/,
          'number.float'
        ],
        [/\d+/, 'number'],

        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],

        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

        [/'([^'\\]|\\.)*$/, 'unicodeIdentifier.invalid'], // non-teminated string
        [
          /'/,
          {
            token: 'unicodeIdentifier.quote',
            bracket: '@open',
            next: '@unicodeIdentifier'
          }
        ],

        // Unknown literals (could be unicode names)
        [
          /.\S*/,
          {
            cases: {
              '@hostSymbols': 'hostSymbol',
              '@variables': 'variable',
              '@default': 'identifier'
            }
          }
        ]
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'], // nested comment
        ['\\*/', 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      unicodeIdentifier: [
        [/[^\\']+/, 'unicodeIdentifier'],
        [/@escapes/, 'unicodeIdentifier.escape'],
        [/\\./, 'unicodeIdentifier.escape.invalid'],
        [
          /'/,
          { token: 'unicodeIdentifier.quote', bracket: '@close', next: '@pop' }
        ]
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment']
      ]
    }
  } as monaco.languages.IMonarchLanguage;
}

export const editorFontFamily = "'Menlo', 'Consolas', monospace,sans-serif";
export const editorFontSize = 14;
export const defaultEditorOptions: monaco.editor.IEditorConstructionOptions &
  monaco.editor.IGlobalEditorOptions = {
  fontSize: editorFontSize,
  lineDecorationsWidth: 4,
  scrollbar: {
    vertical: 'auto',
    verticalScrollbarSize: 8,
    horizontal: 'auto',
    horizontalScrollbarSize: 8
  },
  // This fixes the first time render bug, and handles additional resizes.
  automaticLayout: true,
  contextmenu: false,
  // Don't show a border above and below the current line in the editor.
  renderLineHighlight: 'none',
  lineNumbers: 'off',
  wordWrap: 'on',
  autoClosingBrackets: 'never',
  quickSuggestions: true,
  scrollBeyondLastLine: false,
  // Don't show the minimap (the scaled down thumbnail view of the code)
  minimap: { enabled: false },
  selectionClipboard: false,
  // Don't add a margin on the left to render special editor symbols
  glyphMargin: false,
  revealHorizontalRightPadding: 24,
  find: {
    seedSearchStringFromSelection: 'never',
    autoFindInSelection: 'never'
  },
  suggestOnTriggerCharacters: true,
  codeLens: false,
  // Don't allow the user to collapse the curly brace sections
  folding: false,
  formatOnType: true,
  fontFamily: editorFontFamily,
  wordBasedSuggestions: false,
  // This option helps to fix some of the overflow issues when using the suggestion widget in grid rows
  // NOTE: This doesn't work when it's hosted inside Fluent Callout control
  // More details in https://github.com/microsoft/monaco-editor/issues/2503
  fixedOverflowWidgets: true
};

export const setLanguageSuggestions = (
  monacoParam: typeof monaco,
  suggestions: any[]
): monaco.IDisposable => {
  const tokens: string[] = [];
  suggestions.forEach((item) => {
    tokens.push(...`${item.label}`.split('.'));
  });
  setLanguageTokens(monacoParam, tokens);
  return monacoParam.languages.registerCompletionItemProvider(languageName, {
    provideCompletionItems: function () {
      return {
        suggestions: [...(suggestions || [])].map((item) => {
          return {
            kind: monacoParam.languages.CompletionItemKind.Function,
            insertTextRules:
              monacoParam.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            ...item
          };
        })
      };
    }
  });
};
export const setLanguageTokens = (
  monacoParam: typeof monaco,
  keywords: string[]
): void => {
  monacoParam.languages.setMonarchTokensProvider(
    languageName,
    formulaEditorSyntax({ keywords })
  );
};

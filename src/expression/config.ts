import Monaco from "monaco-editor/esm/vs/editor/editor.api";
export const defaultConfig: Monaco.editor.IEditorConstructionOptions &
  Monaco.editor.IGlobalEditorOptions = {
  fontSize: 14,
  lineDecorationsWidth: 4,
  scrollbar: {
    vertical: false,
    verticalScrollbarSize: 0,
    horizontal: false,
    horizontalScrollbarSize: 0,
  },
  // This fixes the first time render bug, and handles additional resizes.
  automaticLayout: true,
  contextmenu: false,
  // Don't show a border above and below the current line in the editor.
  renderLineHighlight: "none",
  lineNumbers: "off",
  wordWrap: "off",
  // autoClosingBrackets: 'never',
  quickSuggestions: true,
  scrollBeyondLastLine: false,
  // Don't show the minimap (the scaled down thumbnail view of the code)
  minimap: { enabled: false },
  selectionClipboard: false,
  // Don't add a margin on the left to render special editor symbols
  glyphMargin: false,
  revealHorizontalRightPadding: 24,
  find: {
    addExtraSpaceOnTop: false,
    seedSearchStringFromSelection: "never",
    autoFindInSelection: "never",
  },
  suggestOnTriggerCharacters: true,
  suggestLineHeight: 24,
  codeLens: false,
  // Don't allow the user to collapse the curly brace sections
  folding: false,
  formatOnType: true,
  fontFamily: "'Menlo', 'Consolas', monospace,sans-serif",
  wordBasedSuggestions: false,
  // This option helps to fix some of the overflow issues when using the suggestion widget in grid rows
  // NOTE: This doesn't work when it's hosted inside Fluent Callout control
  // More details in https://github.com/microsoft/monaco-editor/issues/2503
  fixedOverflowWidgets: true,
};

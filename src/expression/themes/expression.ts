import Monaco from "monaco-editor/esm/vs/editor/editor.api";
export const name = "variableTemplate";
export const defineTheme = (monaco: typeof Monaco, options): void => {
  monaco.editor.defineTheme(options.themeName, {
    base: "vs",
    inherit: true,
    colors: {},
    rules: [
      { token: "boolean", foreground: "#795548" },
      { token: "keyword", foreground: "#B54B8C" },
      { token: "function", foreground: "#295EA3" },
      { token: "number", foreground: "#B64900" },
      { token: "operator", foreground: "#656871" },
      { token: "hostSymbol", foreground: "#742774", fontStyle: "italic" },
      { token: "variable", foreground: "#007C85" },
    ],
  });
  monaco.editor.setTheme(options.themeName);
};

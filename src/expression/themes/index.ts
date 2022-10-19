import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { defineTheme as variable, name as expressionName } from './expression'
interface Options {
    themeName?: string;
}

const themeStrategy = {
    [expressionName]: variable,
};

export const defineTheme = (monaco: typeof Monaco, options: Options) => {
    const { themeName } = options;
    return themeStrategy[themeName](monaco, options);
};

export const defaultTheme = expressionName
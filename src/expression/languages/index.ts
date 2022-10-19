import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { register as variable, name as expressionName } from "./expression";

type suggestion = {
  label: string;
  insertText: string;
  detail: string;
  [key: string]: any;
};

type languageName = typeof expressionName;

interface Options {
  languageName?: languageName;
  suggestions: suggestion[];
  suffix?: string
}

const languageStrategy = {
  [expressionName]: variable,
};

export const register = (monaco: typeof Monaco, options: Options) => {
  const { languageName = expressionName, ...option } = options;
  return languageStrategy[languageName](monaco, option);
};

export const defaultLanguage = expressionName

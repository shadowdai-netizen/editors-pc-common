import { editorsConfigKey } from "./constant";

export interface CSSVars {
  primaryColor: string;
  primaryColorActive: string;
  primaryColorConfirm: string;
  successColor: string;
  warningColor: string;
  fontSizeHeader: string;
  fontSizeContent: string;
  fontColorHeader: string;
  fontColorContent: string;
  fontColorDisable: string;
  borderRadius: string;
  boxShadow: string;
  boxShadowPrimary: string;
  boxShadowHover: string;
  [x: string]: string;
}

export interface ConfigProviderProps {
  cssVars?: CSSVars;
  props?: {
    size: "small" | "middle" | "large";
    [x: string]: any
  }
}

export function config({ cssVars, props }: ConfigProviderProps) {
  if (cssVars) {
    const styleElement = document.createElement('style');
    styleElement.id = '__style_theme__';
    document.body.appendChild(styleElement);

    let themeStr = '';

    Object.keys(cssVars).forEach((cssVar) => {
      themeStr += `--${cssVar.replace(/\B([A-Z])/g, '-$1').toLowerCase()}:${cssVars[cssVar]};\n`;
    });

    const cssText = `:root {
    ${themeStr}
  }`;

    styleElement.innerHTML = cssText;
  }

  if (props) {
    (window as any)[editorsConfigKey] = {};

    Object.keys(props).forEach(key => {
      (window as any)[editorsConfigKey][key] = props[key];
    });
  }
}

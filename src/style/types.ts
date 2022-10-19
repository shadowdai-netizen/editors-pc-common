export type SelectOptions = Array<{ label: string; value: string }>;

export type AnyMap = { [key: string]: any };

export type RegexFnKey = 'default' | 'number';

export type OnBlurFnKey = 'default' | 'alpha' | '>0';

export type OptionsKey =
  | 'fontWeight'
  | 'fontStyle'
  | 'borderStyle'
  | 'backgroundSize'
  | 'backgroundRepeat'
  | 'backgroundPosition';

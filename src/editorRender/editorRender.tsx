import React from 'react';

import { EditorProps } from '../interface';

export default function ({ editConfig }: EditorProps): JSX.Element {
  const { value, options = {} } = editConfig;
  const { render: CustomRender, ...others } = options;

  return typeof CustomRender === 'function' ? (
    CustomRender({ editConfig: { value, options: { ...others } } })
  ) : (
    <CustomRender editConfig={{ value, options: { ...others } }} />
  );
}

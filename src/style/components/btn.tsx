import React from 'react';

import { AnyMap } from '../types';

import css from './index.less';

interface Props {
  title?: string;
  style?: AnyMap;

  onClick?: (...args: any) => void;
}

export default function ({
  title = '按钮',
  style = {},
  onClick = () => {},
}: Props): JSX.Element {
  return (
    <div className={css.btnContainer} style={style} onClick={onClick}>
      {title}
    </div>
  );
}

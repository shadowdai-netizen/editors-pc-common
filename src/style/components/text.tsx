import React from 'react';
import { useObservable } from '@mybricks/rxui';

import css from './index.less';

class Ctx {
  value: string = '';
}

export default function ({
  type = 'text',
  value = '',

  onBlur,
  onChange,
  onKeyPress,
}: any): JSX.Element {
  const ctx: Ctx = useObservable(Ctx, (next) => next({ value }));

  return (
    <div className={css.textContainer}>
      <input
        type={type}
        className={css.input}
        // value={ctx.value}
        defaultValue={ctx.value}
        // disabled={readonly}
        onChange={(evt) => {
          const val = evt.target.value;
          ctx.value = val;
          onChange && onChange(val);
        }}
        onKeyPress={(evt) => {
          if (evt.key !== 'Enter') return;
          onKeyPress && onKeyPress(ctx.value);
        }}
        onBlur={() => {
          onBlur && onBlur(ctx.value);
        }}
        // {...other}
      />
    </div>
  );
}

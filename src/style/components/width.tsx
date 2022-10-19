import React from 'react';

import { Ctx } from '../Style';
import GreyContainer from './greyContainer';
import { observe, useObservable } from '@mybricks/rxui';

import css from './index.less';

class EditCtx {
  width!: string;
}

const unitOptions = ['px', '%'];

export default function (): JSX.Element {
  const ctx: Ctx = observe(Ctx, { from: 'parents' });
  const editCtx: EditCtx = useObservable(EditCtx, (next) => {
    next({
      width: ctx.val.width,
    });
  });

  return (
    <div className={css.editorContainer}>
      <div className={css.editorTitle}>宽度</div>
      <div className={css.toolbar} style={{ justifyContent: 'space-between' }}>
        <GreyContainer
          type="input"
          label="宽"
          onBlurFnKey=">0"
          regexFnKey="number"
          style={{ width: '50%' }}
          // unitOptions={unitOptions}
          defaultValue={parseFloat(editCtx.width)}
          onChange={(width) => {
            editCtx.width = width;
            ctx.set({ width: width + 'px' });
          }}
        />
      </div>
    </div>
  );
}

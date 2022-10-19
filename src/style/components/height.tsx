import React from 'react';

import { Ctx } from '../Style';
import GreyContainer from './greyContainer';
import { observe, useObservable } from '@mybricks/rxui';

import css from './index.less';

class EditCtx {
  height!: string;
}

const unitOptions = ['px', '%'];

export default function (): JSX.Element {
  const ctx: Ctx = observe(Ctx, { from: 'parents' });
  const editCtx: EditCtx = useObservable(EditCtx, (next) => {
    next({
      height: ctx.val.height,
    });
  });

  return (
    <div className={css.editorContainer}>
      <div className={css.editorTitle}>高度</div>
      <div className={css.toolbar}>
        <GreyContainer
          type="input"
          label="高"
          onBlurFnKey=">0"
          regexFnKey="number"
          style={{ width: '50%' }}
          // unitOptions={unitOptions}
          defaultValue={parseFloat(editCtx.height)}
          onChange={(height) => {
            editCtx.height = height;
            ctx.set({ height: height + 'px' });
          }}
        />
      </div>
    </div>
  );
}

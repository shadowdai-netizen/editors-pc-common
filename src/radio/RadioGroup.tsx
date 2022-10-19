import React, { useCallback } from 'react';

import { Radio } from 'antd';
import css from './index.less';
import { useObservable } from '@mybricks/rxui';
import { isValid } from '../utils';

export default function ({ editConfig }): any {
  const { value, options } = editConfig;
  let datasource;
  let props = {};
  if (Array.isArray(options)) {
    datasource = options;
  } else {
    props = options || {};
  }

  const model = useObservable(
    { val: isValid(value.get()) ? value.get() : '', value },
    [value]
  );

  const updateVal = useCallback((val) => {
    model.val = val.target.value;
    model.value.set(model.val);
  }, []);

  return (
    <div className={css.editor}>
      <Radio.Group
        options={datasource}
        buttonStyle={'solid'}
        onChange={updateVal}
        value={model.val}
        optionType="button"
        size="small"
        {...props}
      />
    </div>
  );
}

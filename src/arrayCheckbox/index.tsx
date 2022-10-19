import React, { useMemo, useCallback } from 'react';
import { useObservable } from '@mybricks/rxui';
import { EditConfig } from '@/interface';
import ListSetter from './listSetter/index';
import { isValid, getOptionsFromEditor } from '../utils';

export default function ({ editConfig }: { editConfig: EditConfig }): any {
  const { value, options } = editConfig;

  const model = useObservable(
    { val: isValid(value.get()) ? value.get() : false, value },
    [value]
  );

  const updateVal = useCallback((val) => {
    model.val = val;
    model.value.set(model.val);
  }, []);

  const opt = useMemo(() => {
    return getOptionsFromEditor(options)
  }, [options])

  return (
    <ListSetter
      value={model.val}
      onChange={updateVal}
      items={opt.items}
      getTitle={opt.getTitle}
      editable={opt.editable}
      checkField={opt.checkField}
      visibleField={opt.visibleField}
    />
  );
}

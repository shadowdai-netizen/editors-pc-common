import React from 'react';
import { Select } from 'antd';
import { isValid } from '../../utils';
import { useComputed, useObservable } from '@mybricks/rxui';

import css from './index.less';

interface Item {
  value: any;
  label: string;
}

interface SelectType {
  props: any;
  className?: string;
}

export default function ({ props, className }: SelectType): any {
  let Readonly: boolean = false;
  let Group: boolean | any[] = false;
  let Multiple = false;
  const { value, options = [] } = props;
  const model = useObservable({
    val: isValid(value.get()) ? value.get() : '',
    value,
  });

  useComputed(() => {
    const v = value.get();
    model.val = isValid(v) ? v : '';
  });

  if (!Array.isArray(options)) {
    const { readonly = false, group = [], multiple = false } = options;
    Readonly = readonly;
    Group = Array.isArray(group) ? group : [];
    Multiple = multiple;
  }

  return (
    <div className={`${css['select__c']} ${className || ''}`}>
      <Select
        size="small"
        mode={Multiple ? 'multiple' : undefined}
        className={css['select__c-input']}
        value={model.val}
        disabled={Readonly}
        dropdownClassName={css['select__c-dropdown']}
        defaultActiveFirstOption={false}
        options={(Group ? Group : options).map((item: Item) => {
          return {
            label: item.label,
            value: item.value,
          };
        })}
        onChange={(val) => {
          model.val = val;
          model.value.set(model.val);
        }}
      />
    </div>
  );
}

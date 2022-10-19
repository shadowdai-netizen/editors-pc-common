import React, { useCallback } from 'react';

import { Select } from 'antd';
import { useObservable } from '@mybricks/rxui';

import { EditorProps } from '../interface';
import { getOptionsFromEditor } from '../utils';

import css from './index.less';
import { editorsConfigKey } from '../constant';

interface Item {
  value: any;
  label: string;
};

type SelectOptions = Array<Item>;

class Ctx {
  val: any;
  value!: {
    get: Function;
    set: Function;
  };
  relOptions!: {
    showSearch: boolean;
    useAnyToEnter: boolean;
    selectOptions: SelectOptions;
    defaultSelectOptions: SelectOptions;
    otherConfig: { [key: string]: any };
  };
};

function getRelOptions(options: Function) {
  const {
    options: selectOptions,
    showSearch = false,
    useAnyToEnter = false,
    ...res
  } = getOptionsFromEditor(options);

  const relSelectOptions = Array.isArray(selectOptions) ? selectOptions.filter(option => {
    if (!option) return false;

    const { label, value } = option;

    return typeof label === 'string' && typeof value !== 'undefined';
  }) : [];

  return {
    selectOptions: relSelectOptions,
    defaultSelectOptions: relSelectOptions,
    showSearch,
    useAnyToEnter,
    otherConfig: res
  };
};

export default function ({ editConfig }: EditorProps): any {
  const { value, options } = editConfig;
  const model: Ctx = useObservable(Ctx, next => {
    // 获取初始化配置
    const val = value.get();

    next({
      anyOption: null,
      val,
      value,
      relOptions: getRelOptions(options)
    });
  });

  const onChange: (val: any) => void = useCallback((val) => {
    model.val = val;
    model.value.set(model.val);
    // 值变更后重新获取options配置，options可能是函数，内部动态return配置项
    model.relOptions = getRelOptions(options);
  }, []);

  const onSearch: (input: string) => void = useCallback((input) => {
    const { otherConfig, useAnyToEnter, defaultSelectOptions } = model.relOptions;

    let hasSameOption = false;

    // 没有配置filterOption函数并缺useAnyToEnter为真时
    if (typeof otherConfig.filterOption !== 'function' && useAnyToEnter) {
      const options: SelectOptions = defaultSelectOptions.filter(({ label }) => {
        const relLabel = label.toLowerCase();
        const relInput = input.toLowerCase();

        if (!hasSameOption && label === input) {
          hasSameOption = true;
        };

        return relLabel.indexOf(relInput) >= 0;
      });

      if (!hasSameOption && input) {
        options.unshift({ label: input, value: input });
      };

      model.relOptions.selectOptions = options;
    };
  }, []);

  return (
    <div className={`${css['editor-select']} fangzhou-theme`}>
      <Select
        size={(window as any)[editorsConfigKey]?.size || 'small'}
        showSearch={model.relOptions.showSearch || model.relOptions.useAnyToEnter}
        onSearch={onSearch}
        optionFilterProp='label'
        {...model.relOptions.otherConfig}
        value={model.val}
        dropdownClassName='fangzhou-theme'
        onChange={onChange}
        options={model.relOptions.selectOptions}
      />
    </div>
  );
};

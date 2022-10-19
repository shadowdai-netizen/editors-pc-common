import React from 'react';

import { Select } from 'antd';
import { SelectOptions } from '../types';

import css from './index.less';

interface Props {
  defaultValue: any;
  options: SelectOptions;

  onChange: (e: string) => void;
}

export default function ({
  options,
  onChange,
  defaultValue,
}: Props): JSX.Element {
  return (
    <div className={css.selectContainer}>
      <Select
        size="small"
        options={options}
        className={css.select}
        defaultValue={defaultValue}
        dropdownClassName={css.selectDropdown}
        onChange={onChange}
      />
    </div>
  );
}

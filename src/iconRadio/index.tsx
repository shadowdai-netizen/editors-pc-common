import React, { useCallback } from 'react';
import css from './index.less';
import { useObservable } from '@mybricks/rxui';
import { isValid } from '../utils';

interface OptItem {
  label: string;
  value: string | number;
  url: string;
}

const ImgSelect = ({
  value,
  dataSource,
  onChange,
  onSelect,
  size = 'middle',
  multiple = false,
}: {
  value: string | Array<string>;
  dataSource: OptItem[];
  onChange: Function;
  onSelect?: Function;
  size?: string;
  multiple: boolean;
}) => {
  const handleClick = useCallback(
    (v) => {
      if (multiple === false) {
        if (v !== value) {
          typeof onChange === 'function' && onChange(v);
        }
      } else {
        const prevValue = Array.isArray(value) ? Array.from(value) : [];

        // 用户自己定制onSelect场景
        if (typeof onSelect === 'function') {
          const nextVal = onSelect(v, prevValue);
          if (nextVal === undefined || nextVal === null) {
            console.warn(`next val is ${nextVal}`);
            return;
          }
          typeof onChange === 'function' && onChange(nextVal);
          return;
        }

        if (prevValue.includes(v)) {
          prevValue.splice(
            prevValue.findIndex((t) => t == v),
            1
          );
          typeof onChange === 'function' && onChange(prevValue);
        } else {
          typeof onChange === 'function' && onChange([...prevValue, v]);
        }
      }
    },
    [value, onChange]
  );

  return (
    <div className={css.imgSelect}>
      {dataSource.map((item, index) => {
        return (
          <div
            title={item.label}
            className={`${css.imgSelectItem} ${
              multiple
                ? Array.isArray(value) &&
                  value.includes(item.value) &&
                  css.imgSelectItemActive
                : value === item.value && css.imgSelectItemActive
            } ${css[size]}`}
            key={`${item.label}_${index}`}
            onClick={() => handleClick(item.value)}
          >
            <div
              className={css.image}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${item.url})`,
              }}
              key={`img_select_item_${index}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default function ({ editConfig }): any {
  const { value, options } = editConfig;

  let multiple = options.multiple;

  const model = useObservable(
    { val: isValid(value.get()) ? value.get() : multiple ? '' : [], value },
    [value]
  );

  const updateVal = useCallback((val) => {
    model.val = val;
    model.value.set(model.val);
  }, []);

  let props: any = {};
  let dataSource = [];
  if (Array.isArray(options)) {
    dataSource = options;
  } else {
    const { options: datas, ...config } = options || {};
    dataSource = datas;
    props = config;
  }

  return (
    <div className={css.editor}>
      <ImgSelect
        {...props}
        dataSource={dataSource}
        value={model.val}
        onChange={updateVal}
      />
    </div>
  );
}

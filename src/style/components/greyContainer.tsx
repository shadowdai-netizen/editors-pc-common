import React, { useEffect } from 'react';

import { Select } from 'antd';
import { OptionsMap } from '../const';
import { useUpdateEffect } from '../../hooks';
import { useComputed, useObservable } from '@mybricks/rxui';

import {
  AnyMap,
  OptionsKey,
  RegexFnKey,
  OnBlurFnKey,
  SelectOptions,
} from '../types';

import css from './index.less';

interface Props {
  label: string;
  style?: AnyMap;
  defaultValue: any;
  unitOptions?: string[];
  monitorValue?: boolean;
  optionsKey?: OptionsKey;
  regexFnKey?: RegexFnKey;
  type: 'input' | 'select' | 'button';
  onBlurFnKey?: OnBlurFnKey;
  event?: { [key: string]: (...args: any) => void };

  onClick?: () => void;
  onChange: (value: string, cb?: (value: string) => void) => void;
}

class GreyContainerCtx {
  unit?: string;
  defaultOption:
    | {
        label: string;
        value: any;
      }
    | undefined;
  valueStyle!: AnyMap;
  openSelect!: boolean;
  unitOptions!: string[];
  monitorValue!: boolean;
  containerStyle!: AnyMap;
  options?: SelectOptions;
  regexFnKey!: RegexFnKey;
  onBlurFnKey!: OnBlurFnKey;
  value: string | undefined;
  type!: 'input' | 'select' | 'button';
}

export default function ({
  type,
  label,
  style = {},
  optionsKey,
  defaultValue,
  monitorValue,
  unitOptions = [],
  regexFnKey = 'default',
  onBlurFnKey = 'default',

  onClick,
  onChange,
}: Props): JSX.Element {
  const greyContainerCtx: GreyContainerCtx = useObservable(
    GreyContainerCtx,
    (next) => {
      let value = defaultValue;

      if (typeof defaultValue === 'string') {
        value = defaultValue.trim();
      }

      let options: SelectOptions = [];
      let defaultOption = {};

      if (type === 'select' && optionsKey) {
        options = OptionsMap[optionsKey];
        if (Array.isArray(options)) {
          const option = options.find((option) => option.value == value);
          if (option) {
            value = option.label;
            defaultOption = option;
          }
        }
      }

      const { height = 25, ...other } = style;

      let unit = '';

      if (unitOptions.length) {
        unit =
          unitOptions.find((i) => {
            return value.indexOf && value.indexOf(i) !== -1;
          }) || 'px';

        value = parseInt(value);
      }

      next({
        type,
        unit,
        value,
        options,
        regexFnKey,
        onBlurFnKey,
        unitOptions,
        monitorValue,
        defaultOption,
        openSelect: false,
        valueStyle: {
          height,
        },
        containerStyle: other,
      });
    }
  );

  useEffect(() => {
    if (monitorValue) {
      let value = defaultValue;

      if (typeof defaultValue === 'string') {
        value = defaultValue.trim();
      }

      let options: SelectOptions = [];
      let defaultOption = { label: '', value: '' };

      if (type === 'select' && optionsKey) {
        options = OptionsMap[optionsKey];
        if (Array.isArray(options)) {
          const option = options.find((option) => option.value == value);
          if (option) {
            value = option.label;
            defaultOption = option;
          }
        }
      }

      greyContainerCtx.value = value;
      greyContainerCtx.defaultOption = defaultOption;
    }
  }, [defaultValue]);

  useUpdateEffect(() => {
    greyContainerCtx.type = type;
  }, [type]);

  const RenderInput: JSX.Element = useComputed(() => {
    if (greyContainerCtx.type !== 'input') return <></>;
    const height = greyContainerCtx.valueStyle.height || 25;
    const hasUnit = greyContainerCtx.unitOptions.length > 0;

    return (
      <div className={`${css.input} ${hasUnit ? css.hasUnit : ''}`}>
        <input
          value={greyContainerCtx.value}
          onChange={(e) => {
            const value = RegexFnMap[greyContainerCtx.regexFnKey](
              e.target.value
            );

            greyContainerCtx.value = value;
          }}
          onBlur={() => {
            const value = OnBlurFnMap[greyContainerCtx.onBlurFnKey](
              greyContainerCtx.value || ''
            );
            let resValue = value;
            greyContainerCtx.value = resValue;

            if (hasUnit) {
              resValue = resValue + greyContainerCtx.unit;
            }

            onChange(resValue, (v) => {
              greyContainerCtx.value = v;
            });
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && e.code === 'Enter') {
              // @ts-ignore
              e.target.blur && e.target.blur();
            }
          }}
        />
        {hasUnit && (
          <div className={css.unitSelect}>
            <Select
              size="small"
              dropdownAlign="bottomright"
              dropdownMatchSelectWidth={false}
              open={greyContainerCtx.openSelect}
              defaultValue={greyContainerCtx.unit}
              dropdownClassName={css.selectDropdown}
              options={greyContainerCtx.unitOptions.map((unit) => {
                return { label: unit, value: unit };
              })}
              style={{ width: 38, height, visibility: 'hidden' }}
              onChange={(value: any) => {
                greyContainerCtx.unit = value;
                onChange(greyContainerCtx.value + value);
              }}
              onDropdownVisibleChange={(isOpen: boolean) => {
                greyContainerCtx.openSelect = isOpen;
              }}
            />
            <div
              className={css.unit}
              style={{
                lineHeight: /px$/.test(height) ? height : height + 'px',
                height,
              }}
              onClick={() => {
                greyContainerCtx.openSelect = true;
              }}
            >
              {greyContainerCtx.unit}
            </div>
          </div>
        )}
      </div>
    );
  });

  const RenderSelect: JSX.Element = useComputed(() => {
    if (greyContainerCtx.type !== 'select') return <></>;
    const height = greyContainerCtx.valueStyle.height || 25;

    return (
      <div className={css.select}>
        <Select
          size="small"
          labelInValue
          dropdownMatchSelectWidth={false}
          options={greyContainerCtx.options}
          open={greyContainerCtx.openSelect}
          dropdownClassName={css.selectDropdown}
          style={{ width: '100%', height, opacity: 0 }}
          defaultValue={greyContainerCtx.defaultOption}
          onChange={({ value, label }: { value: any; label: string }) => {
            greyContainerCtx.value = label;
            onChange(value);
          }}
          onDropdownVisibleChange={(isOpen: boolean) => {
            greyContainerCtx.openSelect = isOpen;
          }}
        />
        <div
          className={css.value}
          style={{ lineHeight: /px$/.test(height) ? height : height + 'px' }}
          onClick={() => {
            greyContainerCtx.openSelect = true;
          }}
        >
          {greyContainerCtx.value}
        </div>
      </div>
    );
  });

  const RenderButton: JSX.Element = useComputed(() => {
    if (greyContainerCtx.type !== 'button') return <></>;

    return (
      <div className={css.button} onClick={() => onClick && onClick()}>
        {greyContainerCtx.value}
      </div>
    );
  });

  return (
    <div style={{ ...greyContainerCtx.containerStyle, overflow: 'hidden' }}>
      <div className={css.greyContainer} style={greyContainerCtx.valueStyle}>
        <div className={css.value}>
          {type === 'input' && RenderInput}
          {type === 'select' && RenderSelect}
          {type === 'button' && RenderButton}
        </div>
      </div>
      <div className={css.label}>{label}</div>
    </div>
  );
}

const RegexFnMap = {
  number: (value: string) => {
    // TODO 区分是否可以输入小数点以及正负数
    // return value.replace(/[^\d]/g,'')
    return value.match(/-?[0-9]*\.?[0-9]*/)?.[0];
  },
  default: (value: any) => {
    return value;
  },
};

const OnBlurFnMap = {
  '>0': (value: string) => {
    let num = Number(value);

    if (isNaN(num) || num < 0) {
      num = 0;
    }

    return num;
  },
  alpha: (value: string) => {
    let alpha = Number(value);

    if (alpha > 100) {
      alpha = 100;
    } else if (alpha < 0) {
      alpha = 0;
    }

    return alpha;
  },
  default: (value: any) => {
    return value;
  },
};

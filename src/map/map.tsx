import React, { useEffect, useCallback } from 'react';
import { AutoComplete, Button, Input } from 'antd';
import { useObservable } from '@mybricks/rxui';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { isValid, deepCopy } from '../utils';
import css from './index.less';

interface InputRenderProps {
  type: 'text' | 'auto';
  options: any;
  notEditable: boolean;
  placeholder: string;
  key: 'v' | 'k';
  idx: number;
}

export default function ({ editConfig }: any): any {
  const { value, options = {} } = editConfig;
  const {
    kType = 'text',
    vType = 'text',
    kOption,
    option,
    readonly = false,
    notaddel = false,
    noteditkey = false,
    noteditvalue = false,
    allowEmptyString = false,
  } = options;

  const model: any = useObservable(
    {
      val: isValid(value.get()) ? deepCopy(value.get()) : {},
      k: [],
      v: [],
      kAutoOptions: kOption,
      vAutoOptions: option,
      value,
    },
    [value]
  );

  const autoChange = useCallback((v, idx, key) => {
    model[key][idx] = v;
    update();
  }, []);

  const customInput = useCallback(({ type, options, notEditable, key, placeholder, idx }: InputRenderProps) => {
    if (type === 'text') {
      return (
        <Input
          placeholder={placeholder}
          disabled={readonly || notEditable}
          value={model[key][idx]}
          onChange={(evt) => {
            model[key][idx] = evt.target.value;
          }}
          onKeyPress={(evt) => {
            if (evt.key !== 'Enter') return;
            update();
          }}
          onBlur={update}
        />
      );
    } else if (type === 'auto') {
      return !readonly && !notEditable ? (
        <AutoComplete
          size='small'
          value={model[key][idx]}
          options={model[key][idx] && model[key][idx].length ? [] : options}
          dropdownMatchSelectWidth={200}
          placeholder={placeholder}
          onChange={(v) => autoChange(v, idx, key)}
        />
      ) : (
        <Input
          placeholder={placeholder}
          disabled={readonly || notEditable}
          value={model[key][idx]}
        />
      );
    }
  }, []);

  const update = useCallback(() => {
    const res: any = {};
    model.k.forEach((item: string, idx: number) => {
      const opt = model.kAutoOptions?.find(({ label }: { label: string }) => label === item);
      if ((item && item.length) || allowEmptyString) {
        res[opt?.value || item] = model.v[idx];
      }
    });
    model.value.set(res);
  }, []);

  const add = useCallback(() => {
    model.k.push('');
    model.v.push('');
  }, []);

  const del = useCallback((idx) => {
    model.k.splice(idx, 1);
    model.v.splice(idx, 1);
    update();
  }, []);


  useEffect(() => {
    model.k = Object.keys(model.val).map(item => {
      return model.kAutoOptions?.find(({ value }: { value: any }) => value === item)?.label || item;
    });
    model.v = Object.keys(model.val).map((item) => {
      return model.val[item].length ? model.val[item] : '';
    });

    // return () => {
    //   const mv = model.val
    //   const vg = value.get()

    //   if (!vg) {
    //     update()
    //   } else if (!Object.keys(mv).length && Object.keys(vg).length) {
    //     update()
    //   } else {
    //     for (let i in model.k) {
    //       if (mv[model.k[i]] !== model.v[i]) {
    //         update()
    //         break
    //       }
    //     }
    //   }
    // }
  }, []);

  return (
    <div className={`${css['editor-map']} fangzhou-theme`}>
      {model.k.map((item: any, idx: number) => {
        return (
          <div key={`item_${idx}`} className={css['editor-map__item']}>
            {/* <input
                type='text'
                placeholder="键名"
                className={css['editor-map__item-v']}
                value={item}
                disabled={readonly || noteditkey}
                onChange={evt => {
                  model.k[idx] = evt.target.value
                }} 
                onKeyPress={evt => {
                  if (evt.key !== 'Enter') return
                  // if (evt.which !== 13) return
                  update()
                }}
                onBlur={update}/> */}
            {customInput({ type: kType, options: model.kAutoOptions?.map(({ label }: { label: string }) => ({ label, value: label })), notEditable: noteditkey, key: 'k', placeholder: '键名', idx })}
            <span className={css['editor-map__item-equal']}>:</span>
            {customInput({ type: vType, options: model.vAutoOptions, notEditable: noteditvalue, key: 'v', placeholder: '键值', idx })}
            {!readonly && !notaddel && (
              <div className={css['editor-map__item-del']}>
                <DeleteOutlined onClick={() => del(idx)} />
              </div>

              // <div className={css['editor-map__item-del']} onClick={() => del(idx)}>x</div>
            )}
          </div>
        );
      })}
      {!readonly && !notaddel && (
        <div className={css['editor-map__add']}>
          <Button
            icon={<PlusOutlined />}
            type="dashed"
            size="middle"
            block
            onClick={add}
          >
            添加键值对
          </Button>
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useCallback, useState, useEffect } from 'react';

import { Button, Input, Select, InputNumber } from 'antd';
import { EditorProps } from '../interface';
import { useObservable } from '@mybricks/rxui';
import { getOptionsFromEditor, isValid } from '../utils';

import css from './index.less';

const { Option } = Select;

export default function ({ editConfig }: EditorProps): JSX.Element {
  const { value, options } = editConfig;
  const {
    options: selectOptions,
    readonly = false,   
    ...config
  } = getOptionsFromEditor ( options );
  const model = useObservable (
    { 
      val: isValid( value.get() ) ? value.get() : null, value,
    },
    [value]
  );

  let types:{ [key: string]: any } = {
    text: '文本',
    boolean: '布尔',
    number: '数字'
  }
  //kinds的改写
  let kinds: { [key: string]: any} = {};
  selectOptions.map((item: any)=>{
    kinds[ item ] = types[ item ]  
  })
  let keys = Object.keys(kinds);
  //存储每个输入框的值
  let [text, setText] = useState<string | undefined>('');
  let [boolean, setBoolean] = useState<string | undefined>('');
  let [number, setNumber] = useState<any>();
  let [keyWord, setKeyWord] = useState(keys[0]);

  //封装画布中model.val值类型匹配函数
  const responseMatchFun = (testVal: any, setVal: any)=>{
    if (typeof testVal === 'boolean') {
      setKeyWord('boolean');
      setBoolean(setVal + '')
    } else if (typeof testVal === 'number') {
      setKeyWord('number')
      setNumber(setVal)
    } else if (typeof testVal === 'string') {
      setKeyWord('text')
      setText(setVal)
    }
  }
  //封装输入框键入值实时变化类型判断函数
  const realMatchFun = (testVal: any)=>{
    if (typeof testVal === 'boolean') {
      const newVal = testVal + ''
      setBoolean(newVal)
    } else if (typeof testVal === 'number') {
      setNumber(testVal)
    } else if (typeof testVal === 'string') {
      setText(testVal)
    }
  }
  //封装按钮切换时，页面上输入框中的值会随时变化函数
  const onClickMatchFun = (testVal: any, setVal: any)=>{
    if(testVal === 'text'){
      setVal.set(text)
    }
    if(testVal === 'boolean'){
      setVal.set(boolean)
    }
    if(testVal === 'number'){
      setVal.set(number)
    }
  }
  //匹配响应区域的value对应到相对应的输入框类型
  useEffect(()=>{
    responseMatchFun(model.val,model.value.get())
  },[])

  const setInput = (v: any) => {
    realMatchFun(v)
  }

  const valOnChange = (v: any) => {
    setInput(v);
    model.value.set(v);
  }

  //按钮触发keys的变化
  let [i,setI] = useState(0);
  const onClick = () => {
    i++;
    if(i > keys.length - 1){
      i=0;
    }
    setI(i);
    setKeyWord(keys[i]);
    //解决切换按钮时，页面上输入框中的值保持不变
    onClickMatchFun(keys[i],model.value)
  }

  return (
    <div className={css['editor-textArea']}>
      <Input 
        size='small'
        value={text}
        disabled={readonly}
        style={keyWord !=='text' ? {display:'none'}: void 0}
        type='text'
        {...config}
        onChange={(e) => valOnChange(e.target.value)}>
      </Input>
      <Select
        size='small'
        {...config}
        style={keyWord !=='boolean' ? {display:'none'}: void 0}
        value={boolean}
        onChange={(v) => {
          valOnChange(v === 'true' ? true : false);
        }}
      >
        {<Option value='true'>True</Option>}
        {<Option value='false'>False</Option>}
      </Select>
      <InputNumber
        size='small'
        disabled={readonly}
        style={keyWord !=='number' ? {display:'none'}: void 0}
        {...config}
        value={number}
        onChange={valOnChange}
        className={css.inputNumber}
      />
      <Button
        size='small'
        className={css.button}
        onClick={onClick}
      >
        <span>{kinds[keyWord]}</span>
      </Button>
    </div>
  );
}
import React, { useCallback, useMemo } from 'react';
import { Modal } from 'antd';
import * as icons from '@ant-design/icons';
import { isValid } from '../utils';
import { useComputed, useObservable } from '@mybricks/rxui';
// import { EditorProps } from '../index'
import css from './index.less';

const IconList = Object.keys(icons).filter(key => key.endsWith('ed'))
const Icon = (props: any) => {
  const {
    type,
    fontSize,
    color,
    spin,
    className,
    rotate
  } = props

  // @ts-ignore
  const RenderIcon = icons[type]

  if (!RenderIcon) return <></>

  return <RenderIcon
    style={{fontSize, color}}
    spin={spin}
    className={className}
    rotate={rotate}
  />
}

export default function ({ editConfig }): any {
  const { value, options = {} } = editConfig;
  const { readonly = false } = options;
  const model: any = useObservable({ length: 80, value }, [value]);

  useComputed(() => {
    model.val = isValid(value.get()) ? String(value.get()) : '';
  });

  const updateVal = useCallback((item) => {
    model.val = item;
    model.value.set(item);
    close();
  }, []);

  const modalContext = useObservable({
    visible: false,
  });

  const open = useCallback(() => {
    if (readonly) return;
    modalContext.visible = true;
    setTimeout(() => {
      model.length = renderIcons.length;
    }, 0);
  }, []);

  const close = useCallback(() => {
    modalContext.visible = false;
    model.length = 80;
  }, []);

  const renderIcons = useMemo(() => {
    if (readonly) return [];

    return IconList.map((item: string) => (
      <div
        key={item}
        className={css.icon}
        onClick={() => {
          updateVal(item);
        }}
      >
        <Icon type={item} fontSize={40} />
      </div>
    ));
  }, []);

  return (
    <div className={css['editor-icon']}>
      <button
        className={css['editor-icon__button']}
        onClick={open}
        style={{ cursor: readonly ? 'defatult' : 'pointer' }}
      >
        {readonly ? (
          <Icon type={model.val} />
        ) : (
          <span>
            <Icon
              type={model.val}
              className={css['editor-icon__button-editIcon']}
            />
            打开图标选择器
          </span>
        )}
      </button>
      <Modal
        wrapClassName={css.wrap}
        visible={modalContext.visible}
        title='选择图标'
        width='505px'
        footer={null}
        bodyStyle={{
          maxHeight: 800,
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
        }}
        style={{ top: 38 }}
        className={css.iconBody}
        maskClosable={false}
        destroyOnClose={true}
        onCancel={close}
        getContainer={() => document.body}
      >
        {renderIcons.slice(0, model.length)}
      </Modal>
    </div>
  );
}

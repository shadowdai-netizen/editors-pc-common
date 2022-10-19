import React, {FC, useCallback, useState} from 'react';
import {Button} from 'antd';
import HotAreaEditDrawer from './hot-area-edit';

import style from './index.less';

const HotArea: FC = ({ editConfig }: any) => {
  const { value, options = {}, } = editConfig;
  const [src, coordinates] = value.get();
  const [visible, setVisible] = useState(false);

  const closeDrawer = useCallback(() => setVisible(false), []);
  const showDrawer = useCallback(() => setVisible(true), []);
  const onOK = useCallback((coordinates: any) => {
    value.set(coordinates);
    setVisible(false);
  }, []);

  return (
    <>
      <Button size="small" onClick={showDrawer} className={style.openBtn}>
        {options.buttonText ?? '编辑'}
      </Button>
      <HotAreaEditDrawer
        coordinates={coordinates}
        src={src}
        title={options.title ?? '编辑热区'}
        visible={visible}
        onClose={closeDrawer}
        onOK={onOK}
      />
    </>
  );
};

export default HotArea;
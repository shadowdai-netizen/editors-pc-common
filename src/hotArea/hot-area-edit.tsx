import React, {FC, useCallback, useEffect, useState} from 'react';
import {Button, Drawer, Form, Input} from 'antd';
import {DrawerProps} from 'antd/lib/drawer';
import CropsSketch from 'react-mixin-crops';
import {max, omit, trim} from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';

import style from './index.less';

type HotAreaEditDrawerProps = DrawerProps & { onOK(coordinates: any): void; coordinates: any[]; src: string; };
const BASE_COORDINATE_ID = 'backgroundLink'
const HotAreaEditDrawer: FC<HotAreaEditDrawerProps> = props => {
  const [coordinates, setCoordinates] = useState(props.coordinates.filter(c => c.id !== BASE_COORDINATE_ID));
  const [form] = Form.useForm();

  useEffect(() => {
    if (!props.visible) {
      form.resetFields();
    } else {
      const coordinates = props.coordinates.filter(c => c.id !== BASE_COORDINATE_ID);

      setCoordinates(coordinates.map(c => {
        return {
          ...c,
          x: (c.x / 414) * 544,
          y: (c.y / 414) * 544,
          width: (c.width / 414) * 544,
          height: (c.height / 414) * 544,
        };
      }));
      form.setFieldsValue(props.coordinates.reduce((pre, c) => {
        return { ...pre, [c.id]: { link: c.link } };
      }, {}));
    }
  }, [props.visible]);

  const changeCoordinate = useCallback((coordinate, index, coordinates) => {
    setCoordinates(coordinates.map(
      (c: any) => ({ ...c, width: max([50, c.width]), height: max([50, c.height]) })
    ));
  }, []);
  const deleteCoordinate = useCallback(coordinate => {
    setCoordinates(coordinates => coordinates.filter(c => c.id !== coordinate.id));
  }, []);
  const onOK = useCallback(() => {
    form.validateFields().then(values => {
      props.onOK([
        { id: BASE_COORDINATE_ID, link: values[BASE_COORDINATE_ID]?.link ?? '' },
        ...coordinates.map(c => {
          return {
            ...c,
            link: values[c.id]?.link ?? '',
            x: (c.x / 544) * 414,
            y: (c.y / 544) * 414,
            width: (c.width / 544) * 414,
            height: (c.height / 544) * 414,
          }
        })
      ]);
    });
  }, [coordinates, props.onOK]);

  const add = useCallback(() => {
    setCoordinates(coordinates => {
      let offset = 0;
      while (true) {
        const coordinate = coordinates.find(c => c.x === offset && c.y === offset);

        if (!coordinate) {
          break;
        }

        offset += 25;
      }
      return [...coordinates, { x: offset, y: offset, width: 50, height: 50, id: String(Date.now()) }];
    });
  }, []);

  return (
    <Drawer
      maskClosable
      destroyOnClose
      zIndex={10001}
      width={900}
      className={style.hotAreaDrawer}
      footer={(
        <div className={style.drawerFooter}>
          <Button onClick={props.onClose as any}>取消</Button>
          <Button className={style.okBtn} type="primary" onClick={onOK}>确定</Button>
        </div>
      )}
      {...omit(props, 'onOK')}
    >
      <div className={style.wrapper}>
        <div className={style.hotAreaContainer}>
          <CropsSketch
            src={props.src}
            width={544}
            coordinates={coordinates}
            onChange={changeCoordinate}
            onDelete={deleteCoordinate}
          />
        </div>
        <div className={style.hotAreaOperate}>
          <Form form={form} layout="vertical">
            <Form.Item
              name={[BASE_COORDINATE_ID, 'link']}
              normalize={trim}
              label="底图链接"
              rules={[() => ({
                validator(_, value: string) {
                  if (value) {
                    if (!value.startsWith('https://') && !value.startsWith('kwai://') ) {
                      return Promise.reject(Error('跳转链接仅支持 kwai/https 链接'));
                    }
                  }

                  return Promise.resolve();
                }
              })]}
            >
              <Input placeholder="可填写图片跳转链接" />
            </Form.Item>
            {coordinates.map((coordinate, index) => {
              return (
                <Form.Item
                  key={coordinate.id}
                  name={[coordinate.id, 'link']}
                  normalize={trim}
                  rules={[() => ({
                    validator(_, value: string) {
                      if (value) {
                        if (!value.startsWith('https://') && !value.startsWith('kwai://') ) {
                          return Promise.reject(Error('跳转链接仅支持 kwai/https 链接'));
                        }
                      }

                      return Promise.resolve();
                    }
                  })]}
                  label={(
                    <div className={style.label}>
                      <div className={style.labelTitle}>热区 {index + 1}</div>
                      <Button
                        type="link"
                        className={style.deleteIcon}
                        icon={<DeleteOutlined />}
                        onClick={() => deleteCoordinate(coordinate)}
                      />
                    </div>
                  )}
                >
                  <Input placeholder={`可填写点击热区 ${index + 1} 后跳转的链接`} />
                </Form.Item>
              );
            })}
            <Form.Item>
              <Button className={style.addHotArea} type="dashed" onClick={add}>添加热区</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Drawer>
  );
};

export default HotAreaEditDrawer;
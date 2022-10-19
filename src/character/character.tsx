import React, { useMemo, useEffect, useCallback } from 'react';
import { Input } from 'antd';
import tinycolor from 'tinycolor2';
import { evt, useObservable } from '@mybricks/rxui';
import Select from '../components/select';
import { EditorProps } from '../interface';
import { createPortal } from 'react-dom';
import { deepCopy, typeCheck } from '../utils';
import SketchPicker from '../components/old-color-picker';
import css from './index.less';

const presetColors = [
  'rgb(245, 34, 45)',
  'rgb(250, 84, 28)',
  'rgb(250, 140, 22)',
  'rgb(250, 173, 20)',
  'rgb(250, 219, 20)',
  'rgb(160, 217, 17)',
  'rgb(82, 196, 26)',
  'rgb(19, 194, 194)',
  'rgb(24, 144, 255)',
  'rgb(47, 84, 235)',
  'rgb(114, 46, 209)',
  'rgb(235, 47, 150)',
  'rgb(255, 77, 79)',
  'rgb(255, 122, 69)',
  'rgb(255, 169, 64)',
  'rgb(255, 197, 61)',
  'rgb(255, 236, 61)',
  'rgb(186, 230, 55)',
  'rgb(115, 209, 61)',
  'rgb(54, 207, 201)',
  'rgb(64, 169, 255)',
  'rgb(89, 126, 247)',
  'rgb(255 255 255)',
  'rgba(255, 255, 255, 0)',
];

const defaultVal = {
  fontWeight: 'normal',
  fontSize: 12,
  letterSpacing: 0,
  lineHeight: 1,
  color: '#000000',
};

const fontWeightList = [
  {
    label: '正常',
    value: 'normal',
  },
  {
    label: '加粗',
    value: 'bold',
  },
];

const fontSizeList = [12, 14, 16, 18, 21, 24, 36, 48, 60, 72];

export default function ({ editConfig }: EditorProps): any {
  const { value, options = [] } = editConfig;
  let defaultEditorMap: any = {};
  const optionsKeyAry = typeCheck(options, 'array') ? options : [];
  if (!optionsKeyAry.length) {
    defaultEditorMap = {
      fontWeight: true,
      fontSize: true,
      letterSpacing: true,
      lineHeight: true,
      color: true,
    };
  } else {
    optionsKeyAry.forEach((item: string) => {
      defaultEditorMap[item] = true;
    });
  }

  const model = useObservable(
    {
      value,
      hexfocus: false,
      container: null,
      colorPicker: null,
      colorDetailMap: {},
      showColorPicker: false,
      val: deepCopy(value.get()) || deepCopy(defaultVal),
    },
    [value]
  ) as any;

  const update = useCallback(() => {
    model.value.set(deepCopy(model.val));
  }, []);

  const init = useCallback(() => {
    const color = tinycolor(model.val.color);
    model.colorDetailMap.hex = color.toHexString();
    model.colorDetailMap.alpha = color.getAlpha() * 100;
  }, []);

  useEffect(() => {
    init();
  }, [value]);

  const updateColor = useCallback(() => {
    const color = tinycolor(model.colorDetailMap.hex);
    if (model.colorDetailMap.alpha < 100) {
      color.setAlpha(model.colorDetailMap.alpha / 100);
    }
    model.val.color = color.toRgbString();
    update();
  }, []);

  const fontWeightProps = {
    options: fontWeightList,
    value: {
      get() {
        return model.val.fontWeight;
      },
      set(val: any) {
        model.val.fontWeight = val;
        update();
      },
    },
  };

  const fontSizeProps = {
    options: fontSizeList.map((item) => ({ value: item, label: item })),
    value: {
      get() {
        return model.val.fontSize;
      },
      set(val: any) {
        model.val.fontSize = val;
        update();
      },
    },
  };

  // 实时更新hex，失去焦点与回车变化情况下才只更新一次
  const updateHex = useCallback(() => {
    const color = tinycolor(model.colorDetailMap.val);
    if (color.toHexString() !== model.colorDetailMap.hex) {
      const r = tinycolor(model.colorDetailMap.hex);
      model.colorDetailMap.hex = r.toHexString();
      updateColor();
    }
  }, []);

  // 实时更新alpha
  const updateAlpha = useCallback(() => {
    const v = Number(model.colorDetailMap.alpha);
    const color = tinycolor(model.val.color);
    if (color.getAlpha() * 100 !== v) {
      if (v >= 0 && v <= 100) {
        model.colorDetailMap.alpha = v;
      } else if (v < 0) {
        model.colorDetailMap.alpha = 0;
      } else {
        model.colorDetailMap.alpha = 100;
      }
      updateColor();
    }
  }, []);

  const onChangeComplete = useCallback((color, _data) => {
    const { colorHex, colorRgba, colorAlpha } = color;
    model.colorDetailMap.hex = colorHex;
    model.val.color = colorRgba;
    model.colorDetailMap.alpha = colorAlpha;
    update();
  }, []);

  const renderSketchPicker = useMemo(() => {
    if (model.showColorPicker) {
      const body = document.body;
      const targetBoundingClientRect = (
        model.ele as any
      )?.getBoundingClientRect();
      const top =
        targetBoundingClientRect.top + targetBoundingClientRect.height + 5;
      const style: any = {};
      if (window.innerHeight - top < 333) {
        style.top =
          (targetBoundingClientRect.top - 333 > 0
            ? targetBoundingClientRect.top - 333
            : 0) + 'px';
      } else {
        style.top = top - 4 + 'px';
      }
      style.right =
        window.innerWidth -
        targetBoundingClientRect.x -
        targetBoundingClientRect.width;
      return createPortal(
        <div
          className={css.popup}
          onClick={() => (model.showColorPicker = false)}
        >
          <div onClick={evt().stop} style={style}>
            <SketchPicker
              color={model.val.color}
              presetColors={presetColors}
              onChangeComplete={onChangeComplete}
            />
          </div>
        </div>,
        body
      );
    }
  }, [model.showColorPicker, model.val.color]);

  return (
    <div className={css['editor-char']}>
      <div className={css['editor-char__item']}>
        {defaultEditorMap.fontWeight && (
          <Select
            className={css['editor-char__font-weight']}
            props={fontWeightProps}
          />
        )}
        {defaultEditorMap.fontSize && (
          <Select
            className={css['editor-char__font-size']}
            props={fontSizeProps}
          />
        )}
      </div>
      <div className={css['editor-char__item']}>
        {defaultEditorMap.letterSpacing && (
          <div className={css['editor-char__item-unit']}>
            <Input
              type="number"
              min="0"
              className={css['editor-char__input']}
              value={model.val.letterSpacing}
              onChange={(evt) => {
                model.val.letterSpacing = Number(evt.target.value);
                update();
              }}
            />
            <p>字距</p>
          </div>
        )}
        {defaultEditorMap.lineHeight && (
          <div className={css['editor-char__item-unit']}>
            <Input
              type="number"
              min="1"
              className={css['editor-char__input']}
              value={model.val.lineHeight}
              onChange={(evt) => {
                model.val.lineHeight = Number(evt.target.value);
                update();
              }}
            />
            <p>行高</p>
          </div>
        )}
        {defaultEditorMap.color && (
          <div
            className={`${css['editor-char__item-unit']} ${css['editor-color__unit']}`}
          >
            <div
              ref={(node) => (model.ele = node)}
              className={css['editor-color__picker']}
              style={{ backgroundColor: model.val.color }}
              onClick={(evt) => colorPickerClick(evt, model)}
            ></div>
            <p>颜色</p>
          </div>
        )}
      </div>
      {renderSketchPicker}
      {/* <div className={css['editor-char__item']}>
        {defaultEditorMap.color && <div className={css['editor-color']}>
          <div
            className={css['color-picker']} 
            ref={(node) => model.colorPicker = node}
            style={{display:model.showColorPicker?'block':'none'}}
          >
            <SketchPicker 
              onChangeComplete={onChangeComplete}
              color={model.val.color}
              presetColors={presetColors}
            />
          </div>
        </div>}
      </div> */}
    </div>
  );
}

function colorPickerClick(evt: any, model: any) {
  model.showColorPicker = true;
  // evt.stopPropagation()
  // model.showColorPicker = !model.showColorPicker
  // const colorMask = document.createElement('div')
  // colorMask.style.height = '100%'
  // colorMask.style.width = '100%'
  // colorMask.style.position = 'absolute'
  // colorMask.style.zIndex = '999'
  // colorMask.style.top = '0px'
  // colorMask.style.left = '0px'
  // colorMask.style.overflowY = 'auto'
  // colorMask.onclick = (e) => {

  //   if (e.target === colorMask) {
  //     model.showColorPicker = false
  //     document.body.removeChild(colorMask)
  //   }
  // }
  // if (evt.clientY > 307) {
  //   model.colorPicker.style.top = evt.clientY - 305 + 'px'
  // } else {
  //   model.colorPicker.style.top = '0px'
  // }
  // if (window.innerWidth - evt.clientX > 220) {
  //   model.colorPicker.style.left = evt.clientX + 'px'
  // } else {
  //   model.colorPicker.style.left = evt.clientX - 218 + 'px'
  // }
  // colorMask.appendChild(model.colorPicker)
  // document.body.appendChild(colorMask)
}

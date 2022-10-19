import React, { useMemo, useRef } from 'react';
// @ts-ignore
import { Alpha, Hue, Saturation, Checkboard, ColorWrap } from 'react-color/lib/components/common';
import SketchFields from 'react-color/lib/components/sketch/SketchFields';
import SketchPresetColors from 'react-color/lib/components/sketch/SketchPresetColors';
import IconColorPalette from './IconColorPalette';

import presetColors from './preset-colors';
import css from './style.less';

const styles = {
  Saturation: {
    radius: '3px',
    shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)',
  },
  Hue: {
    radius: '2px',
    shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)',
  },

  Alpha: {
    radius: '2px',
    shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)',
  },
};

export const Picker = (props: any) => {
  // @ts-ignore
  const { rgb, hex, hsv, hsl, onChange, renderers, onSwatchHover } = props;

  return (
    <div className={css.picker}>
      <div className={css.saturation}>
        <Saturation
          style={styles.Saturation}
          hsl={hsl}
          hsv={hsv}
          onChange={(value) => {
            if (hex === 'transparent') {
              value.a = 100;
            }
            onChange(value);
          }}
        />
      </div>
      <div className={css.controls}>
        {
          'EyeDropper' in window ? <div
            style={{
              width: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '4px'
            }}
            onClick={async () => {
              const eyeDropper = new EyeDropper() // 初始化一个EyeDropper对象
              // console.log('按Esc可退出')
              try {
                const result = await eyeDropper.open() // 开始拾取颜色
                // console.log('result', result)
                // @ts-ignore
                onChange(result.sRGBHex);
              } catch (e) {
                // console.log('用户取消了取色')
              }
            }}>
            <IconColorPalette />
          </div> : null
        }
        <div className={css.sliders}>
          <div className={css.hue}>
            <Hue style={css.Hue} hsl={hsl} onChange={onChange} />
          </div>
          <div className={css.alpha}>
            <Alpha style={css.Alpha} rgb={rgb} hsl={hsl} renderers={renderers} onChange={onChange} />
          </div>
        </div>
        <div className={css.color}>
          <Checkboard />
          <div
            className={css.activeColor}
            style={{
              background: `rgba(${rgb?.r},${rgb?.g},${rgb?.b},${rgb?.a})`,
            }}
          />
        </div>
      </div>
      <SketchFields rgb={rgb} hsl={hsl} hex={hex === 'transparent' ? '#ffffff' : hex} onChange={onChange} disableAlpha={false} />
      <div className={css.fields}>
        <SketchPresetColors colors={presetColors} onClick={onChange} onSwatchHover={onSwatchHover} />
        <div className={css.transparentBox} onClick={() => onChange({ hex: 'rgba(255, 255, 255, 0)', source: 'hex' })}>
          <Checkboard />
        </div>
      </div>
    </div>
  );
};

export default ColorWrap(Picker);

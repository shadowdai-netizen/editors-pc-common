import React, { useMemo, useCallback, useEffect } from 'react';

import { AnyMap } from '../types';
import { createPortal } from 'react-dom';
import SketchPicker from '../../components/color-picker';
// @ts-ignore
import { evt, observe, useComputed, useObservable } from '@mybricks/rxui';

import css from './index.less';
import { Ctx } from '../Style';

interface Props {
  style: AnyMap;
  defaultValue: any;
  monitorValue?: boolean;
  onChange: (color: string) => void;
}
/**
 * 已废弃
 */
class ColorCtx {
  color: any;
  showColorPicker: boolean = false;
  node: HTMLDivElement | undefined | null;
}

export default function ({
  defaultValue,
  onChange,
  style = {},
  monitorValue,
}: Props): JSX.Element {
  const ctx: Ctx = observe(Ctx, { from: 'parents' });
  const colorCtx: ColorCtx = useObservable(ColorCtx, (next) => {
    next({
      node: void 0,
      color: defaultValue,
      showColorPicker: false,
    });
  });

  useEffect(() => {
    if (monitorValue) {
      colorCtx.color = defaultValue;
    }
  }, [defaultValue]);

  const onChangeComplete: (color: string) => void = useCallback((color) => {
    colorCtx.color = color;
    onChange(color);
  }, []);

  const RenderSketchPicker: React.ReactPortal | undefined = useMemo(() => {
    if (colorCtx.showColorPicker) {
      const body = document.body;
      const targetBoundingClientRect = (
        colorCtx.node as any
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
          onClick={() => {
            colorCtx.showColorPicker = false;
          }}
        >
          <div style={style} onClick={evt().stop}>
            <SketchPicker
              color={colorCtx.color}
              onChangeComplete={onChangeComplete}
            />
          </div>
        </div>,
        body
      );
    }
  }, [colorCtx.showColorPicker, colorCtx.color]);

  const Render: JSX.Element = useComputed(() => {
    return (
      <>
        <div
          className={css.value}
          ref={(node) => (colorCtx.node = node)}
          style={{
            background: colorCtx.color,
          }}
          onClick={() => {
            colorCtx.showColorPicker = true;
          }}
        />
        <div className={css.label}>颜色</div>
      </>
    );
  });

  return (
    <div className={css.colorContainer} style={style}>
      {Render}
      {RenderSketchPicker}
    </div>
  );
}

import React, { useMemo } from 'react';
import ColorEditor from '../../components/color-editor';
import { Ctx } from '../Style';
import RenderSelect from './select';
import { SelectOptions } from '../types';
import GreyContainer from './greyContainer';
import { FontFamilyOptions } from '../const';
import { observe, useObservable } from '@mybricks/rxui';

import css from './index.less';

const fontFamilyRegex =
  /font-family\s*?:(([^";<>]*?"[^";<>]*?")|(\s*[^";<>\s]*))*;?/g;

class EditCtx {
  color!: string;
  fontSize!: string;
  fontStyle!: string;
  fontWeight!: string;
  fontFamily!: string;
  lineHeight!: string;
  letterSpacing!: string;
  fontFamilyOptions!: SelectOptions;

  projectData: any;
}

export const Font = function ({ hasLetterSpace = false }) {
  const ctx: Ctx = observe(Ctx, { from: 'parents' });
  const editCtx: EditCtx = useObservable(EditCtx, (next) => {
    // const pubFontFamily = decodeURIComponent(ctx.projectData.pubFontFamily);
    // const fontFamilyAry = pubFontFamily.match(fontFamilyRegex);
    const otherOptions: SelectOptions = (ctx.projectData.fontfaces || []).map((item: any) => {
      const { label } = item
      return {
        label,
        value: label
      }
    });

    const defaultOptions: SelectOptions = (ctx.projectData.defaultFontfaces || []).map((item: any) => {
      const { label } = item
      return {
        label,
        value: label
      }
    });

    // if (Array.isArray(fontFamilyAry)) {
    //   fontFamilyAry.forEach((item) => {
    //     const matchRes = item.match(/(\"(.*?)\")|\'(.*?)\'/gi);

    //     if (matchRes) {
    //       const value = matchRes[0];
    //       otherOptions.push({ label: value, value });
    //     }
    //   });
    // }

    next({
      color: ctx.val.color,
      fontSize: ctx.val.fontSize,
      fontStyle: ctx.val.fontStyle,
      fontWeight: ctx.val.fontWeight,
      fontFamily: ctx.val.fontFamily,
      lineHeight: ctx.val.lineHeight,
      letterSpacing: ctx.val.letterSpacing,
      fontFamilyOptions: otherOptions.concat(FontFamilyOptions).concat(defaultOptions),
    });
  });

  const Render: JSX.Element = useMemo(() => {
    return (
      <div className={css.editorContainer}>
        <div className={css.editorTitle}>字体</div>
        {ctx?.fontProps && ctx?.fontProps?.fontFamily !== false ?
          <RenderSelect
            options={editCtx.fontFamilyOptions}
            defaultValue={editCtx.fontFamily}
            onChange={(fontFamily) => {
              ctx.set({ fontFamily });
            }}
          />
          :
          <></>}
        <div className={css.toolbar}>
          <ColorEditor
            value={editCtx.color}
            onChange={(color: string) => {
              ctx.set({ color });
            }}
            style={{ marginRight: 7, minWidth: 72, maxWidth: 72 }}
          />
          <GreyContainer
            label="粗体"
            type="select"
            optionsKey="fontWeight"
            style={{ marginRight: 7, flex: 1, cursor: 'pointer' }}
            defaultValue={editCtx.fontWeight}
            onChange={(fontWeight) => {
              ctx.set({ fontWeight });
            }}
          />
          <GreyContainer
            label="风格"
            type="select"
            optionsKey="fontStyle"
            style={{ minWidth: 55, flex: 1, cursor: 'pointer' }}
            defaultValue={editCtx.fontStyle}
            onChange={(fontStyle) => {
              ctx.set({ fontStyle });
            }}
          />
        </div>
        <div className={css.toolbar}>
          <GreyContainer
            type="input"
            label="大小(px)"
            onBlurFnKey=">0"
            regexFnKey="number"
            style={{ marginRight: 7, minWidth: 72, maxWidth: 72 }}
            defaultValue={parseInt(editCtx.fontSize)}
            onChange={(value) => {
              const lineHeight =
                parseInt(editCtx.lineHeight) -
                parseInt(editCtx.fontSize) +
                value +
                'px';
              const fontSize = value + 'px';
              editCtx.lineHeight = lineHeight;
              editCtx.fontSize = fontSize;
              ctx.set({
                lineHeight,
                fontSize,
              });
            }}
          />
          <GreyContainer
            label="行间距(px)"
            type="input"
            onBlurFnKey="default"
            regexFnKey="number"
            style={{ marginRight: 7, flex: 1 }}
            defaultValue={
              parseInt(editCtx.lineHeight) - parseInt(editCtx.fontSize)
            }
            onChange={(value) => {
              const lineHeight = parseInt(editCtx.fontSize) + Number(value) + 'px';
              editCtx.lineHeight = lineHeight;
              ctx.set({
                lineHeight,
              });
            }}
          />
          {hasLetterSpace ? (
            <GreyContainer
              label="字间距(px)"
              type="input"
              onBlurFnKey="default"
              regexFnKey="number"
              style={{ flex: 1 }}
              defaultValue={parseInt(editCtx.letterSpacing)}
              onChange={(letterSpacing) => {
                ctx.set({ letterSpacing: letterSpacing + 'px' });
              }}
            />
          ) : (
            <div style={{ flex: 1 }}></div>
          )}
        </div>
      </div>
    );
  }, [hasLetterSpace]);

  return Render;
};

export default () => <Font hasLetterSpace={false} />;

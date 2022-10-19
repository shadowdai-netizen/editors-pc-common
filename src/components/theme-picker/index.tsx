import React, { useCallback, useMemo } from 'react';
import { EditorProps } from '@/interface';
import css from './style.less';

export default function ({
  color,
  onChangeComplete,
}: {
  color: string;
  onChangeComplete: (color: string) => void;
}) {
  const THEME_LIST: any[] = (window as any)['fangzhou-themes'] || [];
  if (!THEME_LIST.length) {
    return null;
  }
  const themeList = useMemo(() => {
    return THEME_LIST.map(({ id, name, description }) => {
      return (
        <div
          className={`
            ${css.themeItem} 
            ${`var(${id})` === color ? css.selected : ''}
          `}
          onClick={() => onChangeComplete(`var(${id})`)}
        >
          <div
            className={css.dot}
            style={{ background: `var(${id}, rgba(0, 0, 0, 0.25))` }}
          ></div>
          <div className={css.right}>
            <div className={css.text}>{name}</div>
            <div className={css.desc}>{description}</div>
          </div>
        </div>
      );
    });
  }, [color]);
  return <div className={css.themePicker}>{themeList}</div>;
}

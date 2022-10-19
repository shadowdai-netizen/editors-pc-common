import React from 'react';
import { useCallback } from 'react';
// import { EditorProps } from '../index'
import { useObservable, dragable } from '@mybricks/rxui';
import { isValid, uuid, deepCopy, getCurrentNodeByClassName } from '../utils';
import css from './index.less';

export default function ({ editConfig }: any): any {
  const { value, options } = editConfig;
  const { label = false, isDrag = true } = options;
  const model = useObservable(
    { val: isValid(value.get()) ? deepCopy(value.get()) : [], value },
    [value]
  );

  const update = useCallback(() => {
    model.value.set(deepCopy(model.val));
  }, []);

  const addClick = useCallback(() => {
    if (!Array.isArray(model.val)) {
      model.val = [];
    } else {
      model.val.push(label ? uuid() : '');
    }
    update();
  }, []);

  const del = useCallback((idx) => {
    model.val.splice(idx, 1);
    update();
  }, []);

  const mouseDown = useCallback((currentNode: any, e: any, idx: number) => {
    const moveNode = document.createElement('div');
    const copyNode = currentNode.cloneNode(true);
    const po = currentNode.getBoundingClientRect();
    const startY = po.top;

    moveNode.style.position = 'absolute';
    moveNode.style.left = `${po.left}px`;
    moveNode.style.top = `${po.top}px`;
    moveNode.style.opacity = '0.5';
    moveNode.style.zIndex = '1000';
    moveNode.style.width = `${po.width}px`;

    dragable(e, ({ po: { x, y }, dpo: { dx, dy } }: any, state: string) => {
      if (state === 'start') {
        moveNode.appendChild(copyNode);
        document.body.appendChild(moveNode);
        currentNode.style.opacity = '0.5';
      }
      if (state === 'moving') {
        moveNode.style.top = `${y + dy}px`;
        moveNode.style.left = `${x + dx}px`;
      }
      if (state === 'finish') {
        const interval = startY - y;
        let count = 0;

        if (interval < 0) {
          count = Math.floor(-interval / 32);

          if (count) {
            const variable = model.val.splice(idx, 1)[0];
            model.val.splice(count + idx, 0, variable);
          }
        } else if (interval > 0) {
          const variable = model.val.splice(idx, 1)[0];

          count = Math.floor(interval / 32);

          if (idx - count > 0) {
            model.val.splice(idx - count, 0, variable);
          } else {
            model.val.unshift(variable);
          }
        }

        currentNode.style.opacity = '1';
        document.body.removeChild(moveNode);

        update();
      }
    });
  }, []);

  return (
    <div className={css['editor-draglist']}>
      {model.val.map((item: any, idx: number) => {
        return (
          <div key={`${item}_${idx}`} className={css['editor-draglist__item']}>
            <div
              className={css['editor-draglist__move']}
              onMouseDown={(e) => {
                if (!isDrag) return;
                const currentNode = getCurrentNodeByClassName(
                  e,
                  'editor-draglist__item'
                );
                if (currentNode) {
                  mouseDown(currentNode, e, idx);
                }
              }}
            >
              <UnorderedListOutlined />
            </div>
            <div
              className={css['editor-draglist__item-name']}
              key={`${item}_${idx}`}
            >
              {label || item}
            </div>
            <div
              className={css['editor-draglist__item-del']}
              onClick={() => del(idx)}
            >
              x
            </div>
          </div>
        );
      })}
      <button className={css['editor-draglist__button']} onClick={addClick}>
        添加
      </button>
    </div>
  );
}

function UnorderedListOutlined() {
  return (
    <span
      role="img"
      aria-label="unordered-list"
      className="anticon anticon-unordered-list"
    >
      <svg
        className="editor-draglist__svg-move"
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="unordered-list"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          className="editor-draglist__svg-move"
          d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z"
        />
      </svg>
    </span>
  );
}

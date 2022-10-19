import React, { useEffect, useCallback } from 'react';

import { hasScripts, loadScript, uuid } from '../utils';
import { monacoLoader } from '../const';

const defaultOptions = {
  automaticLayout: true,
  detectIndentation: false,
  formatOnType: true,
  rtSave: true,
};

type numOrStr = number | string;

export interface Props {
  width?: numOrStr;
  height?: numOrStr;
  value?: string;
  language?: string;
  fontSize: numOrStr;
  theme?: 'light' | 'vs-dark';
  readOnly?: boolean;
  tabSize?: number;
  wordWrap?: string;
  rtSave?: boolean;
  comments: string;
  instanceId: string;
  commentsLineNumber: number;
  autoSave: boolean;
  onMounted: (monaco: any, editor: any) => void;
  onChange?: (v: string) => void;
}

const HbEdit = (props: Props) => {
  const iframeId = uuid();
  const {
    value = '',
    language = 'javascript',
    theme = 'light',
    tabSize = 2,
    readOnly = false,
    wordWrap = 'on',
    autoSave = true,
    ...rest
  } = props;
  const contentChange = useCallback((val: string) => {
    if (props.onChange) {
      props.onChange(val);
    }
  }, []);

  const onMonacoMounted = (monaco: any, editor: any) => {
    if (props.onMounted) {
      props.onMounted(monaco, editor);
    }
  };

  useEffect(() => {
    let iframe: any;
    let iframeDoc: any;
    let codeEditor: any;
    // 配置全局方法，被iframe内调用
    (window as any)[`hb_monaco_editor_change_${iframeId}`] = contentChange;
    (window as any)[`hb_monaco_editor_mounted_${iframeId}`] = onMonacoMounted;
    // 获取iframe设置宽高
    iframe = document.getElementById(iframeId);
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.body.style.margin = '0px';
    iframeDoc.body.style.overflow = 'hidden';

    // 判断是否已经引入monaco相关CDN

    const bool = hasScripts(monacoLoader, iframeDoc);
    const monacoId = uuid();

    if (!bool) {
      // 创建编辑器容器，用于monaco建立编辑器，设置id、style
      codeEditor = document.createElement('div');
      codeEditor.id = monacoId;
      codeEditor.style.width = '100%';
      codeEditor.style.height = '100%';
      codeEditor.style.backgroundColor =
        theme === 'vs-dark' ? '#1e1e1e' : '#fffffe';
      iframeDoc.body.appendChild(codeEditor);
      // 加载相关cdn，加载完成后插入script生成编辑器
      loadScript(
        function () {
          const iframeScript = document.createElement('script');
          const options = {
            ...defaultOptions,
            value,
            language,
            theme,
            tabSize,
            readOnly,
            wordWrap,
            minimap: {
              enabled: false,
            },
            ...rest,
          };

          iframeScript.innerHTML = `
          require.config({
            paths: {
              vs: 'https://ali-ec.static.yximgs.com/udata/pkg/eshop/fangzhou/pub/pkg/monaco-editor/0.28.0/min/vs',
            },
          });
          require(['vs/editor/editor.main'], function () {
            window.parent.hb_monaco_${monacoId} = monaco.editor.create(
              document.getElementById('${monacoId}'), ${JSON.stringify(
            options
          )} )

            window.parent.hb_monaco_editor_mounted_${iframeId}(monaco, window.parent.hb_monaco_${monacoId})
            window.parent.hb_monaco_${monacoId}.onDidChangeModelContent(({ changes }) => {
              if (${autoSave}) {
                window.parent.hb_monaco_editor_change_${iframeId}(window.parent.hb_monaco_${monacoId}.getValue())
              }
            })
            window.parent.hb_monaco_${monacoId}.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
              window.parent.hb_monaco_editor_change_${iframeId}(window.parent.hb_monaco_${monacoId}.getValue());
            })
          })`;
          iframeDoc.body.appendChild(iframeScript);
        },
        monacoLoader,
        iframe.contentWindow,
        iframeDoc
      );
    }

    return () => {
      (window as any)[`hb_monaco_editor_change_${iframeId}`] = null;
      (window as any)[`hb_monaco_editor_mounted_${iframeId}`] = null;
      (window as any)[`hb_monaco_${monacoId}`] = null;
      codeEditor = null;
      iframe = null;
      iframeDoc = null;
    };
  }, []);

  return <iframe id={iframeId} frameBorder={0} />;
};

export default HbEdit;

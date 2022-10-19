import  React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MonacoEditor from "@mybricks/code-editor";
import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { EditorProps } from "../interface";
import { defaultConfig } from "./config";
import { defaultLanguage, register } from "./languages";
import { defaultTheme, defineTheme } from "./themes";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
} from "@ant-design/icons";
import styles from "./index.less";
import { message } from "antd";
import { runPlugin } from './plugins'

const DefaultHeight = 22;
let languageInstance: any;
export default ({ editConfig, env }: EditorProps) => {
  const {
    value,
    options: {
      runCode,
      language = defaultLanguage,
      theme = defaultTheme,
      suggestions,
      plugins = []
    },
  } = editConfig;
  const monacoRef = useRef<any>({});
  const editorRef = useRef<any>({});
  const valConfig = value.get();
  const [_value, setValue] = useState<any>(
    typeof valConfig === "string" ? valConfig : valConfig?.value
  );
  const [editorHeight, setEditorHeight] = useState<number>(DefaultHeight);
  const [result, setResult] = useState();
  const [markers, setMarkers] = useState([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      languageInstance?.dispose();
      languageInstance = null
    };
  }, []);

  useEffect(() => {
    const line = `${_value}`.split("\n").length;
    setEditorHeight(DefaultHeight * line);
  }, [_value]);

  const onMonacoMounted = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    languageInstance?.dispose();
    languageInstance = register(monaco, {
      languageName: language,
      suggestions
    });
    defineTheme(monaco, { themeName: theme });
    editor.onDidFocusEditorWidget(() => {
      setShowDropdown(true)
    });
    editor.onDidBlurEditorWidget(() => {
      setTimeout(() => {
        setShowDropdown(false);
      }, 100);
    });
    _runCode(_value);
  };

  const onChange = (code: string) => {
    setValue(code);
    _runCode(code);
    value.set(code);
  };

  const setModelMarkers = (markers = [], code: string = "") => {
    if(Array.isArray(markers) && markers.length){
      markers = markers.map(marker => ({
        message: marker.message,
        startLineNumber: 0,
        endLineNumber: `${code}`.split("\n").length + 1,
        length: code.length + 1,
      }))
    }
    monacoRef.current.editor.setModelMarkers(
      editorRef.current.getModel(),
      "owner",
      markers
    );
    setMarkers(markers);
  };

  const reset = () => {
    setModelMarkers([]);
    setResult(undefined);
  }

  const _runCode = (code: string) => {
    if (!!code) {
      try {
        runPlugin(plugins, code)
        if ("function" === typeof runCode) {
          const { success, error } = runCode(code);
          if (error) {
            setModelMarkers(error, code);
            setResult(undefined);
            return;
          }
          if (success !== undefined) {
            setModelMarkers([]);
            setResult(success);
          }
        } else {
          reset()
        }
      } catch (error) {
        setModelMarkers([error], code)
        setResult(undefined);
      }
    } else {
      reset()
    }
  };

  const onClipboard = useCallback(async () => {
    const input = document.createElement("input");
    input.value = JSON.stringify(result);
    document.body.appendChild(input);
    input.select();
    try {
      await document.execCommand("copy");
      message.success("复制成功");
    } catch (error) {
      message.error("复制失败，请重试");
    }
    document.body.removeChild(input);
  }, [result]);

  const showError = useMemo(
    () => showDropdown && !!markers.length,
    [showDropdown, markers.length]
  );

  const showSuccess = useMemo(
    () => showDropdown && result !== undefined && !!_value,
    [showDropdown, result]
  );

  return (
    <div
      className={`${styles.wrap}  ${showDropdown ? styles.focus : ''} ${showError ? styles.error : ''} ${showSuccess ? styles.success : ''
        }`}
      onClick={() => editorRef.current?.trigger?.('', 'editor.action.triggerSuggest', '')}
    >
      <MonacoEditor
        {...defaultConfig}
        value={_value}
        height={editorHeight}
        language={language}
        theme={theme}
        onMounted={onMonacoMounted}
        onChange={onChange}
        env={env}
      />
      {showError && (
        <div className={styles.marker}>
          <div className={styles.title}>
            <CloseCircleFilled /> Error
          </div>
          <ul>
            {markers.map((marker, index) => (
              <li key={index}>{marker.message}</li>
            ))}
          </ul>
        </div>
      )}
      {showSuccess && (
        <div className={styles.result}>
          <div className={styles.title}>
            <span>
              <CheckCircleFilled /> Success
            </span>
            <span onClick={onClipboard} style={{ cursor: "copy" }}>
              <CopyOutlined />
            </span>
          </div>
          <div>{JSON.stringify(result)}</div>
        </div>
      )}
    </div>
  );
};

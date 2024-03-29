import { EditorProps } from "./interface";
import EditorCharacter from "./character";
import EditorSelect from "./select";
import EditorColorPicker from "./colorPicker";
import EditorList from "./list";
import EditorInputNumber from "./inputNumber";
import EditorSwitch from "./switch";
import EditorTextInput from "./textInput";
import EditorIconRadio from "./iconRadio";
import EditorImageSelector from "./imageSelector";
import EditorTextArea from "./textArea";
import EditorAlign from "./align";
import EditorIcon from "./icon";
import EditorRadio from "./radio";
import EditorCode from "./jsCoder";
import EditorMap from "./map";
import EditorRichText from "./richText";
import EditorDragList from "./draglist";
import EditorSlider from "./slider";
import EditorArray from "./array";
import Style from "./style";
import expressionCodeEditor from "./expressionCode";
import EditorArrayCheckbox from "./arrayCheckbox";
import EditorMapCheckbox from "./mapCheckbox";
import { typeCheck } from "./utils";
import EditorRender from "./editorRender";
import EditorValueSelect from "./valueSelect";
import Expression from "./expression";
import "./index.less";
export { config } from "./configProvider";

const PcEditorMap: any = {
  ALIGN: EditorAlign,
  EXPCODE: expressionCodeEditor,
  MAP: EditorMap,
  LIST: EditorList,
  ARRAY: EditorArray,
  CODE: EditorCode,
  RADIO: EditorRadio,
  COLORPICKER: EditorColorPicker,
  SELECT: EditorSelect,
  SWITCH: EditorSwitch,
  TEXTAREA: EditorTextArea,
  TEXTINPUT: EditorTextInput,
  RICHTEXT: EditorRichText,
  DRAGLIST: EditorDragList,
  CHARACTER: EditorCharacter,
  ICONRADIO: EditorIconRadio,
  ICON: EditorIcon,
  IMAGESELECTOR: EditorImageSelector,
  INPUTNUMBER: EditorInputNumber,
  SLIDER: EditorSlider,
  STYLE: Style,
  VALUESELECT: EditorValueSelect,
  ARRAYCHECKBOX: EditorArrayCheckbox,
  MAPCHECKBOX: EditorMapCheckbox,
  EDITORRENDER: EditorRender,
  EXPRESSION: Expression,
};

function PcEditor(props: EditorProps): any {
  const { editConfig } = props;

  let editor;
  try {
    editor = PcEditorMap[editConfig.type.toUpperCase()] || editConfig.render;
  } catch (err) {
    console.error(err);
  }

  if (typeCheck(editor, "function")) {
    return editor(props);
  }

  if (typeCheck(editor, "object") && typeCheck(editor.render, "function")) {
    return editor;
  }

  return;
}

export { PcEditor, PcEditorMap };

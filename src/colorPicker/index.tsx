import React from 'react';
import { EditorProps } from '../interface';
import ColorEditor from '../components/color-editor';

export default function ColorPicker({ editConfig }: EditorProps) {
  const { value } = editConfig;
  return (
    <ColorEditor
      value={value.get()}
      onChange={value.set as (color: string) => void}
    />
  );
}

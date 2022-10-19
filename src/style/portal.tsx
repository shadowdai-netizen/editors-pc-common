import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

const div = document.createElement('div');
div.style.height = '100%';

export default function ({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    document.body.appendChild(div);
  }, []);
  return ReactDOM.createPortal(children, div);
}

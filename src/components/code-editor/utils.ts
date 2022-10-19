export function loadScript(
  callback: () => void,
  src: string,
  win = window,
  doc = document
) {
  const script: any = doc.createElement('script');
  const head: HTMLHeadElement = doc.getElementsByTagName('head')[0];
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.src = src;
  if (script.addEventListener) {
    script.addEventListener(
      'load',
      function () {
        callback();
      },
      false
    );
  } else if (script.attachEvent) {
    script.attachEvent('onreadystatechange', function () {
      const target: any = win.event && win.event.srcElement;
      if (target && target.readyState == 'loaded') {
        callback();
      }
    });
  }
  head.appendChild(script);
}

export function hasScripts(src: string, doc = document) {
  const scripts = doc.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src === src) {
      return true;
    }
  }
  return false;
}

export function processSize(size: string | number): string {
  // @ts-ignore
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

export function uuid(pre: string = 'u_', len = 6) {
  const seed = 'abcdefhijkmnprstwxyz0123456789',
    maxPos = seed.length;
  let rtn = '';
  for (let i = 0; i < len; i++) {
    rtn += seed.charAt(Math.floor(Math.random() * maxPos));
  }
  return pre + rtn;
}

export function getLinenumber(str = '') {
  if (!str) return 0;
  return str.split(/\n|\r|\r\n/).length;
}

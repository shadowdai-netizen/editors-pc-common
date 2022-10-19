interface Props {
  presets?: string[];
  errorCallback?: (val: any) => void;
  babelInstance?: any;
}

const transformCodeByBabel = (val: string, props?: Props) => {
  const {
    presets,
    errorCallback,
    babelInstance = (window as any)?.Babel
  } = props || {};
  if (
    typeof babelInstance?.transform !== 'function' ||
    typeof val !== 'string'
  ) {
    return val;
  }
  const res = {
    code: val,
    transformCode: ''
  };
  try {
    let temp = decodeURIComponent(val);
    if (/export\s+default.*async.*function.*\(/g.test(temp)) {
      temp = temp.replace(
        /export\s+default.*function.*\(/g,
        '_RTFN_ = async function _RT_('
      );
    } else if (/export\s+default.*function.*\(/g.test(temp)) {
      temp = temp.replace(
        /export\s+default.*function.*\(/g,
        '_RTFN_ = function _RT_('
      );
    } else {
      temp = `_RTFN_ = ${temp} `
    }
    res.transformCode = encodeURIComponent(
      babelInstance.transform(temp, {
        presets: presets || ['env'],
        comments: false,
      }).code
    );
    res.transformCode = `${encodeURIComponent(`(function() { var _RTFN_; \n`)}${
      res.transformCode
    }${encodeURIComponent(`\n; return _RTFN_; })()`)}`;
  } catch (e) {
    if (typeof errorCallback === 'function') {
      errorCallback(e);
    }
    return val;
  }
  return res;
};

export { transformCodeByBabel }
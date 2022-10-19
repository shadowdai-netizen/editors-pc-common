const validateExpression = (expression: string) => {
  if (!expression.startsWith("{") || !expression.endsWith("}")) {
    throw new Error("请输入{}包裹的表达式");
  }
  const code = expression.substring(1, expression.substring(1).length);
  if (code.includes("{") || code.includes("}")) {
    throw new Error("请输入{}包裹的表达式");
  }
  return expression;
};

const Plugin = {
  validate: validateExpression,
};

export const runPlugin = (plugins = [], expression: string) => {
  try {
    plugins.forEach((plugin) => {
      if (Plugin[plugin]) {
        Plugin[plugin](expression);
      }
    });
  } catch (error) {
    throw error;
  }
};

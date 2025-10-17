module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {
    // 开发环境启用 SourceMap 用于调试
    sourceMap: true,
  },
  h5: {
    // H5 端也启用 SourceMap
    sourceMap: true,
  },
};

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  env: {
    test: {
      presets: [['@babel/preset-env']],
    },
  },
  plugins: ['@babel/plugin-transform-runtime'],
};

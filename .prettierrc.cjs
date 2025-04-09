module.exports = {
  singleQuote: true,
  endOfLine: 'lf',
  trailingComma: 'es5',
  tabWidth: 2,
  overrides: [
    {
      files: '**/*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};

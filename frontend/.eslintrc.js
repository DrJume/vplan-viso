module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    '@vue/eslint-config-airbnb',
    'plugin:vue/recommended',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    semi: ['error', 'never'],
    'vue/comma-dangle': ['error', 'always'],
    'vue/eqeqeq': 'error',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    'vue/brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'vue/singleline-html-element-content-newline': 'off',
    'no-underscore-dangle': 'off',
    'one-var-declaration-per-line': 'off',
    'one-var': 'off',
    'no-param-reassign': 'off',
    'import/no-unresolved': 'off',
    'camelcase': 'off',
    'arrow-parens': 'off',
    'no-plusplus': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}

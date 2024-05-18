import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {files: ['**/*.js'], languageOptions: {sourceType: 'commonjs'}},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        'eol-last': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
    },
  },
]

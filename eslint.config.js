import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        // Electron globals
        require: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-constant-condition': 'error',
      'no-debugger': 'warn',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2],
      'no-trailing-spaces': 'error'
    }
  },
  {
    files: ['src/renderer/**/*.js', 'src/auto-updater.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser/Renderer globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2],
      'no-trailing-spaces': 'error'
    }
  }
]

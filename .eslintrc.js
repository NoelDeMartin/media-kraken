module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/recommended',
        'eslint:recommended',
        '@vue/typescript',
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'indent': ['error', 4, { SwitchCase: 1, MemberExpression: 'off' }],
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
        'space-before-function-paren': 'off',
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
};

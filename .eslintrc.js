module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
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
        '@typescript-eslint/explicit-member-accessibility': ['error', {
            accessibility: 'explicit',
            overrides: {
                constructors: 'no-public',
            },
        }],
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
            varsIgnorePattern: '^_$',
            argsIgnorePattern: '^_$',
            caughtErrorsIgnorePattern: '^_$',
        }],
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
};

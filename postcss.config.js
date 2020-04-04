/* eslint-disable @typescript-eslint/no-var-requires */
const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        './public/index.html',
        './src/**/*.vue',
        './src/assets/markdown/*.md',
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    whitelistPatterns: [/duration-\d+$/],
});

module.exports = {
    plugins: [
        require('tailwindcss')('./src/assets/styles/tailwind.js'),
        require('autoprefixer'),
        ...process.env.NODE_ENV === 'production'
            ? [purgecss]
            : [],
    ],
};

const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        './public/index.html',
        './src/**/*.vue',
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    whitelistPatterns: [/duration-\d+$/],
});

module.exports = {
    plugins: [
        require('tailwindcss')('./src/styles/tailwind.js'),
        require('autoprefixer'),
        ...process.env.NODE_ENV === 'production'
            ? [purgecss]
            : [],
    ],
};

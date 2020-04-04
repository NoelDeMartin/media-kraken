/* eslint-disable @typescript-eslint/no-var-requires */
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const path = require('path');
const version = require('./package.json').version;
const publicPath = process.env.NODE_ENV === 'production' ? '/media-kraken/' : '/';
const title = 'Media Kraken';
const description = 'Track your movies with Media Kraken and never miss a beat!';

process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_PUBLIC_PATH = publicPath;

module.exports = {
    publicPath,
    pages: {
        'index': {
            title,
            description,
            entry: 'src/main.ts',
        },
        '404': {
            title,
            entry: 'src/routing/github-404.ts',
            chunks: ['404'],
        },
    },
    configureWebpack: {
        plugins: [
            new ScriptExtHtmlWebpackPlugin({
                inline: /js\/404\.([^.]+\.)?js$/,
            }),
        ],
        externals: {
            'node-fetch': 'fetch',
            'text-encoding': 'TextEncoder',
            'whatwg-url': 'window',
            'isomorphic-fetch': 'fetch',
            '@trust/webcrypto': 'crypto',
        },
        resolve: {
            alias: process.env.NODE_ENV !== 'production'
                ? {
                    // This is necessary to use npm link for development:
                    // https://stackoverflow.com/questions/31169760/how-to-avoid-react-loading-twice-with-webpack-when-developing
                    soukai: path.resolve('./node_modules/soukai'),
                }
                : {},
        },
    },
    chainWebpack: (config) => {
        // This is necessary to use npm link for development:
        // https://cli.vuejs.org/guide/troubleshooting.html#symbolic-links-in-node-modules
        if (process.env.NODE_ENV !== 'production') {
            config.resolve.symlinks(false);
        }

        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();

        svgRule
            .use('babel-loader')
            .loader('babel-loader')
            .end()
            .use('vue-svg-loader')
            .loader('vue-svg-loader');

        config.module
            .rule('markdown')
            .test(/\.md$/)
            .use('raw-loader')
            .loader('raw-loader');

        config.plugins.delete('prefetch-404');
        config.plugins.delete('preload-404');
    },
    pwa: {
        name: title,
        themeColor: '#4299E1',
        msTileColor: '#4299E1',
        manifestOptions: {
            background_color: '#ffffff',
            orientation: 'portrait',
            version,
        },
        workboxOptions: {
            importWorkboxFrom: 'local',

            // Use precaching or CacheFirst for everything except for index.html,
            // use StaleWhileRevalidate instead to pick up updates.
            exclude: [
                /\.map$/,
                /img\/icons\//,
                /favicon\.ico$/,
                /^manifest.*\.js?$/,
                /index\.html/,
            ],
            runtimeCaching: [
                {
                    urlPattern: /\/$/,
                    handler: 'StaleWhileRevalidate',
                },
                {
                    urlPattern: /.*/,
                    handler: 'CacheFirst',
                },
            ],
        },
    },
};

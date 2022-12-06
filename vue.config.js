/* eslint-disable @typescript-eslint/no-var-requires */
const WorkerPlugin = require('worker-plugin');

const { execSync } = require('child_process');
const path = require('path');
const version = require('./package.json').version;
const isProduction = process.env.NODE_ENV === 'production';
const sourceCommitHash = execSync('git rev-parse HEAD').toString();
const versionName = 'v' + version + (isProduction ? '' : ('-next-' + sourceCommitHash));
const isTesting = process.env.NODE_ENV === 'testing';
const publicPath = isProduction ? '/media-kraken/' : '/';
const title = 'Media Kraken';
const description = 'Track your movies with Media Kraken and never miss a beat!';
const baseUrl = isProduction ? 'https://noeldemartin.github.io/media-kraken/' : 'http://localhost:8080';
const sourceUrl = 'https://github.com/noeldemartin/media-kraken';
const releaseNotesUrl = sourceUrl + (isProduction ? `/releases/tag/${versionName}` : `/tree/${sourceCommitHash}`);

process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_VERSION_NAME = versionName;
process.env.VUE_APP_SOURCE_URL = sourceUrl;
process.env.VUE_APP_RELEASE_NOTES_URL = releaseNotesUrl;
process.env.VUE_APP_PUBLIC_PATH = publicPath;

module.exports = {
    publicPath,
    pages: {
        'index': {
            title,
            description,
            baseUrl,
            version: versionName,
            entry: isTesting ? 'src/index.testing.ts' : 'src/index.ts',
        },
        '404': {
            title,
            baseUrl,
            version: versionName,
            entry: 'src/routing/github-404.ts',
            chunks: [],
        },
        'viewer': {
            title: `${title} Viewer`,
            description,
            baseUrl,
            version: versionName,
            entry: 'src/viewer/index.ts',
            template: 'public/index.html',
        },
    },
    configureWebpack: {
        devtool: 'source-map',
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
        plugins: [
            new WorkerPlugin(),
        ],
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

        // TODO remove this after updating TS version
        // (Inrupt's auth package is using type-only imports in declaration files)
        config.plugins.delete('fork-ts-checker');

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
        themeColor: '#fed7d7',
        msTileColor: '#fed7d7',
        manifestOptions: {
            background_color: '#ffffff',
            orientation: 'portrait',
            version,
        },
        workboxOptions: {
            importWorkboxFrom: 'local',

            // Use precaching or CacheFirst for everything except for index.html,
            // use NetworkFirst instead to pick up updates.
            exclude: [
                /\.map$/,
                /img\/icons\//,
                /favicon\.ico$/,
                /^manifest.*\.js?$/,
                /index\.html/,
            ],
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\/noeldemartin\.github\.io\/media-kraken\/$/,
                    handler: 'NetworkFirst',
                },
                {
                    urlPattern: /^https:\/\/noeldemartin\.github\.io\/media-kraken\/.*/,
                    handler: 'CacheFirst',
                },
            ],
        },
    },
};

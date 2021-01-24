/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, '../src'),
            '@tests': path.resolve(__dirname, '../tests'),
            '@cy': __dirname,
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'ts-loader',
                    options: { transpileOnly: true },
                }],
            },
            {
                test: /\.ttl$/,
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ],
            },
        ],
    },
};

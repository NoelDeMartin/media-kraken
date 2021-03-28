/* eslint-disable @typescript-eslint/no-var-requires */
const { rmdir } = require('fs');
const wp = require('@cypress/webpack-preprocessor');

module.exports = (on) => {
    const options = {
        webpackOptions: require('../webpack.config'),
    };

    on('file:preprocessor', wp(options));
    on('task', {
        deleteFolder (folderName) {
            console.log('deleting folder %s', folderName);

            return new Promise((resolve, reject) => {
                rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
                    if (err) {
                        console.error(err);

                        return reject(err);
                    }

                    resolve(null);
                });
            });
        },
    });
};

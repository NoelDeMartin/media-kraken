const version = require('./package.json').version;

process.env.VUE_APP_VERSION = version;

module.exports = {
    pwa: {
        name: 'Media Tracker',
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

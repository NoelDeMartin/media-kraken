module.exports = {
    theme: {
        screens: {
            'desktop': '640px',
        },
        fontFamily: {
            montserrat: [
                '"Montserrat"',
                'sans-serif',
            ],
        },
        colors: {
            transparent: 'transparent',

            black: {
                default: '#000',
                overlay: 'rgba(0, 0, 0, .1)',
            },

            white: {
                default: '#fff',
            },

            gray: {
                100: '#fff7f7',
                200: '#f4eded',
                300: '#dedede',
                400: '#d1caca',
                500: '#afa4a3',
                600: '#837b7b',
                700: '#5d5556',
                800: '#1b1b1b',
                900: '#080201',
            },

            primary: {
                100: '#fed7d7',
                200: '#feb2b2',
                300: '#f79e9e',
                400: '#f76e6e',
                500: '#f05252',
                600: '#ef4545',
                700: '#e02c2c',
                800: '#bd2424',
                900: '#961f1f',
            },

            blue: {
                100: '#ebfbfe',
                200: '#bce9f1',
                300: '#8bd3e1',
                400: '#6ac3d4',
                500: '#52bace',
                600: '#3ca4b7',
                700: '#3490a0',
                800: '#1c4f58',
                900: '#00272e',
            },

            green: {
                100: '#eef1eb',
                200: '#cef1a2',
                300: '#ade368',
                400: '#8fd633',
                500: '#6ca720',
                600: '#5e951c',
                700: '#5d8a25',
                800: '#3c5d12',
                900: '#223908',
            },
        },
        // Extend default config
        // @see https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
        extend: {
            boxShadow: {
                'solid': '0 0 0 3px currentColor',
            },
            inset: theme => ({
                '16': theme('spacing.16'),
                '1/2': '50%',
                'full': '100%',
            }),
            maxWidth: {
                '0': '0',
                'content': '900px',
            },
            gridTemplateColumns: theme => ({
                ...Object.entries(theme('spacing')).reduce((gridTemplateColumns, [key, value]) => {
                    gridTemplateColumns['fit-' + key] = `repeat(auto-fit, ${value})`;
                    gridTemplateColumns['fill-' + key] = `repeat(auto-fill, minmax(${value}, 1fr))`;

                    return gridTemplateColumns;
                }, {}),
            }),
        },
    },
    variants: {
        opacity: ['responsive', 'hover', 'focus', 'group-hover'],
    },
};

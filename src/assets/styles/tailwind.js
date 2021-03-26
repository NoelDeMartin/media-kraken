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
                overlay: 'rgba(255, 255, 255, .25)',
            },

            'brand-solid': {
                500: '#7c4dff',
                700: '#653add',
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

            red: {
                100: '#fff5f5',
                200: '#fed7d7',
                300: '#feb2b2',
                400: '#fc8181',
                500: '#f56565',
                600: '#e53e3e',
                700: '#c53030',
                800: '#9b2c2c',
                900: '#742a2a',
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

            blue: {
                100: '#ebf8ff',
                200: '#bee3f8',
                300: '#90cdf4',
                400: '#63b3ed',
                500: '#4299e1',
                600: '#3182ce',
                700: '#2b6cb0',
                800: '#2c5282',
                900: '#2a4365',
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
                'readable': '640px',
                'content': '900px',
            },
            maxHeight: {
                '0': '0',
                '41px': '41px',
            },
            opacity: {
                '15': '.15',
                '30': '.3',
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
        display: ['responsive', 'group-hover'],
        margin: ['responsive', 'last'],
        opacity: ['responsive', 'hover', 'focus', 'group-hover'],
        overflow: ['responsive', 'hover'],
        textColor: ['responsive', 'hover', 'focus', 'group-hover'],
        width: ['responsive', 'group-hover'],
    },
};

import { URL, fileURLToPath } from 'node:url';

import Aerogel, { AerogelResolver } from '@aerogel/vite';
import I18n from '@intlify/unplugin-vue-i18n/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import Workspace from 'vite-plugin-multi-root-workspace';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    build: { sourcemap: true },
    base: process.env.NODE_ENV === 'production' ? '/media-kraken/' : '/',
    publicDir: fileURLToPath(new URL('./src/assets/public/', import.meta.url)),
    plugins: [
        Aerogel({ name: 'Media Kraken' }),
        Components({
            deep: true,
            dts: 'src/types/components.d.ts',
            dirs: ['src/components', 'src/pages/**/components'],
            resolvers: [AerogelResolver(), IconsResolver({ customCollections: ['app'] })],
        }),
        I18n({ include: fileURLToPath(new URL('./src/lang/**/*.yaml', import.meta.url)) }),
        Icons({
            iconCustomizer(_, __, props) {
                props['aria-hidden'] = 'true';
            },
            customCollections: {
                app: FileSystemIconLoader('./src/assets/icons'),
            },
        }),
        Workspace(),
    ],
    fmt: {
        semi: true,
        singleQuote: true,
        tabWidth: 4,
        printWidth: 120,
        sortImports: true,
        sortTailwindcss: true,
    },
    lint: {
        options: {
            typeAware: true,
            typeCheck: true,
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        include: ['src/**/*.test.ts'],
    },
});

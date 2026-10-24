import { resolve } from 'node:path';

import Aerogel from '@aerogel/vite';
import { fmt, lint } from '@noeldemartin/vite-plus-config';
import Workspace from 'vite-plugin-multi-root-workspace';
import { defineConfig } from 'vite-plus';

const modules = ['lists', 'movies', 'shows'];

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/media-kraken/' : '/',
    plugins: [Aerogel({ name: 'Media Kraken' }), Workspace()],
    resolve: {
        alias: Object.fromEntries(
            modules.map((module) => [`@${module}`, resolve(import.meta.dirname, `src/modules/${module}`)]),
        ),
    },
    fmt: {
        ...fmt,
        sortImports: { internalPattern: ['~/', '@/', '#', ...modules.map((module) => `@${module}/`)] },
    },
    lint: { extends: [lint] },
});

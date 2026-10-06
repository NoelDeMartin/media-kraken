import Aerogel from '@aerogel/vite';
import { fmt, lint } from '@noeldemartin/vite-plus-config';
import Workspace from 'vite-plugin-multi-root-workspace';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/media-kraken/' : '/',
    plugins: [Aerogel({ name: 'Media Kraken' }), Workspace()],
    fmt,
    lint: { extends: [lint] },
});

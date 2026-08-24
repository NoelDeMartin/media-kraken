import i18n from '@aerogel/plugin-i18n';
import { setup, decorators } from '@aerogel/storybook';
import docs from '@storybook/addon-docs';
import { definePreview } from '@storybook/vue3-vite';

import '../src/assets/css/main.css';

setup({
    plugins: [i18n({ messages: import.meta.glob('@/lang/*.yaml') })],
});

export default definePreview({
    addons: [docs()],
    tags: ['autodocs'],
    decorators,
});

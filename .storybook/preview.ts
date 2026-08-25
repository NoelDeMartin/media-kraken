import { setup, decorators } from '@aerogel/storybook';
import docs from '@storybook/addon-docs';
import { definePreview } from '@storybook/vue3-vite';

import app from '@/main';

setup(app);

export default definePreview({
    addons: [docs()],
    tags: ['autodocs'],
    decorators,
});

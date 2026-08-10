import docs from '@storybook/addon-docs';
import { definePreview } from '@storybook/vue3-vite';

import '../src/assets/css/main.css';

export default definePreview({
    addons: [docs()],
    tags: ['autodocs'],
});

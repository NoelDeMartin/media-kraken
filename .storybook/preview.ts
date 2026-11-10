import { setup, decorators } from '@aerogel/storybook';
import docs from '@storybook/addon-docs';
import { definePreview } from '@storybook/vue3-vite';
import { sb } from 'storybook/test';

import { registerFakes } from '@/lib/stubs/fakes';
import app from '@/main';

import './main.css';

sb.mock(import('../src/modules/lists/lib/sharing.ts'), { spy: true });

registerFakes();
setup(app);

export default definePreview({
    addons: [docs()],
    tags: ['autodocs'],
    decorators,
    parameters: {
        options: {
            storySort: {
                order: [
                    'Foundations',
                    'Atoms',
                    'Molecules',
                    'Organisms',
                    'Modals',
                    'Pages',
                ],
            },
        },
    },
});

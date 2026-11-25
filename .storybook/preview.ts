import { SolidFake } from '@aerogel/plugin-solid';
import { preview, setup } from '@aerogel/storybook';
import docs from '@storybook/addon-docs';
import { definePreview } from '@storybook/vue3-vite';
import { sb } from 'storybook/test';

import { registerFakes } from '@/lib/stubs/fakes';
import app from '@/main';

import './main.css';

sb.mock(import('../src/modules/lists/lib/composition/items.ts'), { spy: true });
sb.mock(import('../src/modules/lists/lib/discovery.ts'), { spy: true });
sb.mock(import('../src/modules/lists/lib/sharing.ts'), { spy: true });

registerFakes();
setup(app);

export default definePreview({
    ...preview,
    addons: [docs()],
    tags: ['autodocs'],
    beforeEach: () => {
        SolidFake.setState({ session: null, previousSession: null, profiles: {} });
    },
    parameters: {
        options: {
            storySort: {
                order: ['Foundations', 'Atoms', 'Molecules', 'Organisms', 'Modals', 'Pages'],
            },
        },
    },
});

import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ImportMediaFromImdbModal from './ImportMediaFromImdbModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/Import/ImportMediaFromImdbModal',
    component: ImportMediaFromImdbModal,
    parameters: { layout: 'fullscreen' },
    render: () => <ModalStory component={ImportMediaFromImdbModal} />,
};

export const Default: Story = {};

export default meta;

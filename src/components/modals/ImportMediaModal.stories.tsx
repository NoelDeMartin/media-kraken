import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ImportMediaModal from './ImportMediaModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/Import/ImportMediaModal',
    component: ImportMediaModal,
    parameters: { layout: 'fullscreen' },
    render: () => <ModalStory component={ImportMediaModal} />,
};

export const Default: Story = {};

export default meta;

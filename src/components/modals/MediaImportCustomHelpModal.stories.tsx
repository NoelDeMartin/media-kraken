import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaImportCustomHelpModal from './MediaImportCustomHelpModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/MediaImportCustomHelpModal',
    component: MediaImportCustomHelpModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    render: () => <ModalStory component={MediaImportCustomHelpModal} />,
};

export const Default: Story = {};

export default meta;

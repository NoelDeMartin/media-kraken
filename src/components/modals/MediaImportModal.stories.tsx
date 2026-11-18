import { ModalStory, modalStoryParameters } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaImportModal from './MediaImportModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/MediaImportModal',
    component: MediaImportModal,
    tags: ['!autodocs'],
    parameters: modalStoryParameters,
    render: () => <ModalStory component={MediaImportModal} />,
};

export const Default: Story = {};

export default meta;

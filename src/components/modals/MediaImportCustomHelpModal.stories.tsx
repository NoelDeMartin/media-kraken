import { ModalStory, modalStoryParameters } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaImportCustomHelpModal from './MediaImportCustomHelpModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/MediaImportCustomHelpModal',
    component: MediaImportCustomHelpModal,
    tags: ['!autodocs'],
    parameters: modalStoryParameters,
    render: () => <ModalStory component={MediaImportCustomHelpModal} />,
};

export const Default: Story = {};

export default meta;

import { ModalStory, modalStoryParameters } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaImportFromImdbModal from './MediaImportFromImdbModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/MediaImportFromImdbModal',
    component: MediaImportFromImdbModal,
    tags: ['!autodocs'],
    parameters: modalStoryParameters,
    render: () => <ModalStory component={MediaImportFromImdbModal} />,
};

export const Default: Story = {};

export default meta;

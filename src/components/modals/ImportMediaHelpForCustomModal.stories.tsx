import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ImportMediaHelpForCustomModal from './ImportMediaHelpForCustomModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/Import/ImportMediaHelpForCustomModal',
    component: ImportMediaHelpForCustomModal,
    parameters: { layout: 'fullscreen' },
    render: () => <ModalStory component={ImportMediaHelpForCustomModal} />,
};

export const Default: Story = {};

export default meta;

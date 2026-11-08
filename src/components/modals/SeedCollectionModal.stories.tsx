import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SeedCollectionModal from './SeedCollectionModal.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Modals/SeedCollectionModal',
    component: SeedCollectionModal,
    parameters: { layout: 'fullscreen' },
    render: () => <ModalStory component={SeedCollectionModal} />,
};

export const Default: Story = {};

export default meta;

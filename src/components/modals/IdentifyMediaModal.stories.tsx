import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import IdentifyMediaModal from './IdentifyMediaModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    initialQuery: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/IdentifyMediaModal',
    component: IdentifyMediaModal,
    parameters: { layout: 'fullscreen' },
    args: { initialQuery: 'the' },
    render: (args) => <ModalStory component={IdentifyMediaModal} props={{ initialQuery: args.initialQuery }} />,
};

export const Default: Story = {};

export const NoResults: Story = { args: { initialQuery: 'not found' } };

export default meta;

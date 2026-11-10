import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaIdentifyModal from './MediaIdentifyModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    initialQuery: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/MediaIdentifyModal',
    component: MediaIdentifyModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: { initialQuery: 'the' },
    render: (args) => <ModalStory component={MediaIdentifyModal} props={{ initialQuery: args.initialQuery }} />,
};

export const Default: Story = {};

export const NoResults: Story = { args: { initialQuery: 'not found' } };

export default meta;

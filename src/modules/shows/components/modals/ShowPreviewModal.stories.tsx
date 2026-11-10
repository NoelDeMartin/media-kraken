import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import tmdbShows from '@shows/lib/stubs/tmdb-shows';

import ShowPreviewModal from './ShowPreviewModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    show: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/ShowPreviewModal',
    component: ShowPreviewModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    argTypes: {
        show: tmdbShows.control,
    },
    args: {
        show: tmdbShows.first,
    },
    render: (args) => ({
        setup: () => () => <ModalStory component={ShowPreviewModal} props={{ show: tmdbShows.resolve(args.show) }} />,
    }),
};

export const Primary: Story = {};

export default meta;

import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import tmdbMovies from '@movies/lib/stubs/tmdb-movies';

import MoviePreviewModal from './MoviePreviewModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/MoviePreviewModal',
    component: MoviePreviewModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    argTypes: {
        movie: tmdbMovies.control,
    },
    args: {
        movie: tmdbMovies.first,
    },
    render: (args) => ({
        setup: () => () => (
            <ModalStory component={MoviePreviewModal} props={{ movie: tmdbMovies.resolve(args.movie) }} />
        ),
    }),
};

export const Primary: Story = {};

export default meta;

import { Button, UI } from '@aerogel/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { onMounted } from 'vue';

import tmdbMovies from '@/lib/stubs/tmdb-movies';

import MoviePreviewModal from './MoviePreviewModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'MoviePreviewModal',
    component: MoviePreviewModal,
    argTypes: {
        movie: tmdbMovies.control,
    },
    args: {
        movie: tmdbMovies.first,
    },
    render(args) {
        const movie = tmdbMovies.resolve(args.movie);

        async function open() {
            await UI.modal(MoviePreviewModal, { movie });
        }

        onMounted(() => open());

        return (
            <div style={{ display: 'flex', justifyContent: 'start' }}>
                <Button onClick={open}>Open</Button>
            </div>
        );
    },
};

export const Primary: Story = {};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@/lib/stubs/solid-movies';

import MovieCard from './MovieCard.vue';
import MoviesGrid from './MoviesGrid.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'MovieCard',
    component: MovieCard,
    argTypes: {
        movie: movies.control,
    },
    args: {
        movie: movies.first,
    },
};

export const Primary: Story = {
    args: {
        movie: 'Symbol',
    },

    render(args) {
        const movie = movies.resolve(args.movie);

        return (
            <div style={{ maxWidth: '90vw', width: '90%', height: '90%', margin: '0 auto' }}>
                <MovieCard movie={movie} style={{ aspectRatio: '2/3', maxHeight: '300px' }} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MoviesGrid movies={movies.all} />
        </div>
    ),
};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@/lib/stubs/movies';
import type Movie from '@/models/Movie';

import MovieCard from './MovieCard.vue';
import MoviesGrid from './MoviesGrid.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
    watched: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'MovieCard',
    component: MovieCard,
    argTypes: {
        movie: movies.control,
        watched: { control: 'boolean' },
    },
    args: {
        movie: movies.first,
    },
};

export const Primary: Story = {
    args: {
        movie: 'Inception',
    },

    render(args) {
        const movie = {
            // oxlint-disable-next-line typescript/no-misused-spread
            ...movies.resolve(args.movie),
            actions: args.watched ? [{}] : [],
            watched: !!args.watched,
        } as unknown as Movie;

        return (
            <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
                <MovieCard movie={movie} style={{ aspectRatio: '2/3' }} />
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

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaGrid from '@/components/MediaGrid.vue';
import movies from '@movies/lib/stubs/solid-movies';

import MovieCard from './MovieCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'modules/movies/MovieCard',
    component: MovieCard,
    argTypes: {
        movie: movies.control,
    },
    args: {
        movie: movies.first,
    },
};

export const Primary: Story = {
    render(args) {
        const movie = movies.resolve(args.movie);

        return (
            <div style={{ maxWidth: '90vw', width: '90%', height: '90%', margin: '0 auto' }}>
                <MovieCard movie={movie} style={{ maxHeight: '300px' }} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid>
                {movies.all.map((movie) => (
                    <MovieCard key={movie.url} movie={movie} />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

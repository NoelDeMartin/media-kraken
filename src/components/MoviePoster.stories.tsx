import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@/lib/stubs/solid-movies';

import MoviePoster from './MoviePoster.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'MoviePoster',
    component: MoviePoster,
    argTypes: {
        movie: movies.control,
    },
    args: {
        movie: movies.first,
    },
    render(args) {
        const movie = movies.resolve(args.movie);

        return (
            <div style={{ maxWidth: '300px', width: '90%', margin: '0 auto', aspectRatio: '2/3' }}>
                <MoviePoster movie={movie} />
            </div>
        );
    },
};

export const Primary: Story = {};

export const InvalidPoster: Story = {
    args: {
        movie: 'Invalid Poster',
    },
};

export const MissingPoster: Story = {
    args: {
        movie: 'Missing Poster',
    },
};

export default meta;

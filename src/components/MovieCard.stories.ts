import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';

import movies from '../data/movies.json';
import MovieCard from './MovieCard.vue';

interface StoryArgs {
    movieId: number;
    watched: boolean;
}

const meta: Meta<typeof MovieCard> & { argTypes: Record<string, unknown>; args: StoryArgs } = {
    title: 'Example/MovieCard',
    component: MovieCard,
    argTypes: {
        movieId: {
            control: { type: 'select' },
            options: movies.map((m) => m.id),
            description: 'Select a movie by id',
        },
        watched: { control: 'boolean' },
    },
    args: {
        movieId: movies[0]?.id ?? 1,
        watched: false,
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (_args) => ({
        components: { MovieCard },
        setup() {
            const args = _args as unknown as StoryArgs;
            const movie = computed(() => {
                const selectedMovie = movies.find((movie) => movie.id === args.movieId) ?? movies[0];

                return { ...selectedMovie, watched: args.watched };
            });

            return { movie };
        },
        template: '<div style="max-width:90vw; width:90%; margin:0 auto;"><MovieCard :movie /></div>',
    }),
};

export const Grid: Story = {
    render: () => ({
        components: { MovieCard },
        setup() {
            return { movies };
        },
        template: `
            <div style="max-width:90vw; width:90%; margin:0 auto;">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
                    <MovieCard v-for="movie in movies" :key="movie.id" :movie />
                </div>
            </div>
        `,
    }),
};

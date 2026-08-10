import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';

import movies from '../data/movies.json';
import MoviePoster from './MoviePoster.vue';

interface StoryArgs {
    movieId: number;
}

const meta: Meta<typeof MoviePoster> & { argTypes: Record<string, unknown>; args: StoryArgs } = {
    title: 'Example/MoviePoster',
    component: MoviePoster,
    argTypes: {
        movieId: {
            control: { type: 'select' },
            options: movies.map((m) => m.id),
            description: 'Select a movie by id',
        },
    },
    args: {
        movieId: movies[0]?.id ?? 1,
    },
    render: (_args) => ({
        components: { MoviePoster },
        setup() {
            const args = _args as unknown as StoryArgs;
            const movie = computed(() => movies.find((movie) => movie.id === args.movieId) ?? movies[0]);

            return { movie };
        },
        template:
            '<div style="max-width:300px; width:90%; margin:0 auto; aspect-ratio:2/3;"><MoviePoster :movie /></div>',
    }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const InvalidUrl: Story = { args: { movieId: 3 } as Record<string, unknown> };
export const MissingUrl: Story = { args: { movieId: 4 } as Record<string, unknown> };

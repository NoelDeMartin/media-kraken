import { computedModel } from '@aerogel/plugin-solid';
import { useSeededModels } from '@aerogel/storybook';
import type { JsonLDGraph } from '@noeldemartin/solid-utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ModelWithUrl } from 'soukai-bis';
import { screen, userEvent } from 'storybook/test';

import movies from '@/lib/fixtures/solid/movies.jsonld';
import solidMovies from '@movies/lib/stubs/solid-movies';
import Movie from '@movies/models/Movie';

import MoviesShow from './Show.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'modules/movies/pages/Show',
    component: MoviesShow,
    argTypes: {
        movie: solidMovies.control,
    },
    args: {
        movie: 'Symbol',
    },
    render: (args) => ({
        setup() {
            const seededMovies = useSeededModels(Movie, { documents: movies as JsonLDGraph[] });
            const movie = computedModel(() =>
                seededMovies.value?.find((seededMovie) => seededMovie.title === args.movie),
            );

            return () => movie.value && <MoviesShow key={movie.value.url} movie={movie.value as ModelWithUrl<Movie>} />;
        },
    }),
};

export const Watched: Story = {};

export const Rewatched: Story = {
    args: { movie: 'The Tale of The Princess Kaguya' },
};

export const RewatchedActions: Story = {
    args: { movie: 'The Tale of The Princess Kaguya' },
    async play() {
        await userEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
    },
};

export const ResetWatchHistoryConfirmation: Story = {
    args: { movie: 'The Tale of The Princess Kaguya' },
    async play() {
        await userEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Mark as dropped' }));
    },
};

export const Pending: Story = {
    args: { movie: 'All That Jazz' },
};

export default meta;

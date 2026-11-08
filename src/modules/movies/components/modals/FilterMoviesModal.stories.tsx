import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { useSampleCollection } from '@/lib/storybook/collection';
import type { MoviesFilter } from '@movies/lib/movies';

import FilterMoviesModal from './FilterMoviesModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    filters: MoviesFilter | null;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/FilterMoviesModal',
    component: FilterMoviesModal,
    parameters: { layout: 'fullscreen' },
    args: { filters: null },
    render: (args) => ({
        setup() {
            const collection = useSampleCollection();

            return () =>
                collection.value && (
                    <ModalStory
                        component={FilterMoviesModal}
                        props={{ movies: collection.value.movies, filters: args.filters }}
                    />
                );
        },
    }),
};

export const Default: Story = {};

export const WithFilters: Story = {
    args: {
        filters: {
            watchingStatus: 'watched',
            genres: ['tmdb:18'],
            directors: null,
            rating: [6, 10],
            withNotes: true,
        },
    },
};

export default meta;

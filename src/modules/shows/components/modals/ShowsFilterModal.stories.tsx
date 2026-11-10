import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { useSampleCollection } from '@/lib/storybook/collection';
import type { ShowsFilter } from '@shows/lib/shows';

import ShowsFilterModal from './ShowsFilterModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    filters: ShowsFilter | null;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/ShowsFilterModal',
    component: ShowsFilterModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: { filters: null },
    render: (args) => ({
        setup() {
            const collection = useSampleCollection();

            return () =>
                collection.value && (
                    <ModalStory
                        component={ShowsFilterModal}
                        props={{ shows: collection.value.shows, filters: args.filters }}
                    />
                );
        },
    }),
};

export const Default: Story = {};

export const WithFilters: Story = {
    args: {
        filters: {
            watchingStatus: 'watching',
            genres: ['tmdb:18'],
            creators: null,
            rating: [6, 10],
            withNotes: true,
        },
    },
};

export default meta;

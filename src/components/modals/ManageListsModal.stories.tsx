import { ModalStory, useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists, type StubList } from '@/lib/stubs/models';
import Movie from '@/models/Movie';

import ManageListsModal from './ManageListsModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    lists: StubList[];
};

const MOVIE_URL = 'solid://movies/the-substance-2024#it';

const meta: Meta<StoryArgs> = {
    title: 'ManageListsModal',
    component: ManageListsModal,
    parameters: { layout: 'fullscreen' },
    args: {
        lists: [
            { name: 'Favorites', mediaUrls: [MOVIE_URL, 'solid://movies/onibaba-1964#it'] },
            { name: 'Halloween marathon', mediaUrls: ['solid://movies/onibaba-1964#it'] },
            { name: 'Watch with friends', mediaUrls: [] },
            {
                name: 'Movies to watch on a rainy Sunday afternoon with a big bowl of popcorn and no plans at all',
                mediaUrls: [MOVIE_URL],
            },
        ],
    },
    render: (args) => ({
        setup() {
            const movies = useSeededModels(Movie, { documents, setup: () => seedLists(args.lists) });

            return () => {
                const media = movies.value?.find((movie) => movie.url === MOVIE_URL);

                return media && <ModalStory component={ManageListsModal} props={{ media }} />;
            };
        },
    }),
};

export const Primary: Story = {};

export const NoLists: Story = {
    args: { lists: [] },
};

export default meta;

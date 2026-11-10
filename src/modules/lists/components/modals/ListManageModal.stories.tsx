import { ModalStory, useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists, type StubList } from '@lists/lib/stubs/lists';
import Movie from '@movies/models/Movie';

import ListManageModal from './ListManageModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    lists: StubList[];
};

const MOVIE_URL = 'local://movies/the-substance-2024#it';

const meta: Meta<StoryArgs> = {
    title: 'Modals/ListManageModal',
    component: ListManageModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        lists: [
            { name: 'Favorites', mediaUrls: [MOVIE_URL, 'local://movies/onibaba-1964#it'] },
            { name: 'Halloween marathon', mediaUrls: ['local://movies/onibaba-1964#it'] },
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

                return media && <ModalStory component={ListManageModal} props={{ media }} />;
            };
        },
    }),
};

export const Primary: Story = {};

export const NoLists: Story = {
    args: { lists: [] },
};

export default meta;

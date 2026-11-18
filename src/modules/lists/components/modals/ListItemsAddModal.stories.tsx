import { ModalStory, modalStoryParameters, useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';

import ListItemsAddModal from './ListItemsAddModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    mediaUrls: string[];
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/ListItemsAddModal',
    component: ListItemsAddModal,
    tags: ['!autodocs'],
    parameters: modalStoryParameters,
    args: {
        mediaUrls: ['local://movies/the-substance-2024#it', 'local://shows/severance-2022/index#it'],
    },
    render: (args) => ({
        setup() {
            const lists = useSeededModels(List, {
                documents,
                setup: () => seedLists([{ name: 'Favorites', mediaUrls: args.mediaUrls }]),
            });

            return () =>
                lists.value?.[0] && <ModalStory component={ListItemsAddModal} props={{ list: lists.value[0] }} />;
        },
    }),
};

export const Primary: Story = {};

export default meta;

import { ModalStory, useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists } from '@/lib/stubs/models';
import List from '@/models/List';

import AddListItemsModal from './AddListItemsModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    mediaUrls: string[];
};

const meta: Meta<StoryArgs> = {
    title: 'AddListItemsModal',
    component: AddListItemsModal,
    parameters: { layout: 'fullscreen' },
    args: {
        mediaUrls: ['solid://movies/the-substance-2024#it', 'solid://shows/severance-2022/info#it'],
    },
    render: (args) => ({
        setup() {
            const lists = useSeededModels(List, {
                documents,
                setup: () => seedLists([{ name: 'Favorites', mediaUrls: args.mediaUrls }]),
            });

            return () =>
                lists.value?.[0] && <ModalStory component={AddListItemsModal} props={{ list: lists.value[0] }} />;
        },
    }),
};

export const Primary: Story = {};

export default meta;

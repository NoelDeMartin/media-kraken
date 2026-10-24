import { useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';
import type ListItem from '@lists/models/ListItem';

import ListItems from './ListItems.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    disabled: boolean;
    mediaUrls: string[];
};

const meta: Meta<StoryArgs> = {
    title: 'modules/lists/ListItems',
    component: ListItems,
    args: {
        disabled: false,
        mediaUrls: [
            'solid://movies/the-substance-2024#it',
            'solid://shows/severance-2022/info#it',
            'solid://movies/the-tale-of-the-princess-kaguya-2013#it',
            'solid://shows/pluribus-2025/info#it',
            'solid://movies/all-that-jazz-1979#it',
            'solid://shows/freaks-and-geeks-1999/info#it',
            'solid://shows/succession-2018/info#it',
        ],
    },
    render: (args) => ({
        setup() {
            const lists = useSeededModels(List, {
                documents,
                setup: () => seedLists([{ name: 'Favorites', mediaUrls: args.mediaUrls }]),
            });

            return () => {
                const list = lists.value?.[0];

                return (
                    list && (
                        <div style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', padding: '0 1.25rem' }}>
                            <ListItems
                                list={list}
                                disabled={args.disabled}
                                onMove={(item: ListItem, target: ListItem) => list.move(item, target)}
                                onRemove={(item: ListItem) => list.removeItem(item)}
                            />
                        </div>
                    )
                );
            };
        },
    }),
};

export const Primary: Story = {};

export const EdgeCases: Story = {
    args: {
        mediaUrls: [
            'solid://movies/missing-poster#it',
            'solid://movies/invalid-poster#it',
            'solid://movies/deleted-movie#it',
            'solid://movies/the-testament-of-dr-mabuse-1933#it',
        ],
    },
};

export const Empty: Story = {
    args: { mediaUrls: [] },
};

export default meta;

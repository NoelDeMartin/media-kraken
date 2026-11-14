import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaGrid from '@/components/MediaGrid.vue';
import lists from '@lists/lib/stubs/solid-lists';

import ListCard from './ListCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    list: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Molecules/ListCard',
    component: ListCard,
    argTypes: {
        list: lists.control,
    },
    args: {
        list: lists.first,
    },
};

export const Primary: Story = {
    render(args) {
        const list = lists.resolve(args.list);

        return (
            <div style={{ width: '16rem', margin: '0 auto' }}>
                <ListCard list={list} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid itemWidth="16rem">
                {lists.all.map((list) => (
                    <ListCard key={list.url} list={list} />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

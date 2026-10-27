import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MediaGrid from '@/components/MediaGrid.vue';
import type { MediaByUrl } from '@lists/lib/composition/lists';
import lists from '@lists/lib/stubs/solid-lists';
import movies from '@movies/lib/stubs/solid-movies';
import shows from '@shows/lib/stubs/solid-shows';

import ListCard from './ListCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    list: string;
};

const mediaByUrl: MediaByUrl = new Map([...movies.all, ...shows.all].map((media) => [media.url, media]));

const meta: Meta<StoryArgs> = {
    title: 'modules/lists/ListCard',
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
                <ListCard list={list} mediaByUrl={mediaByUrl} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid itemWidth="16rem">
                {lists.all.map((list) => (
                    <ListCard key={list.url} list={list} mediaByUrl={mediaByUrl} />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

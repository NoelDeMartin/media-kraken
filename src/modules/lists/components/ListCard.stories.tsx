import { Cache } from '@aerogel/core';
import { SolidFake } from '@aerogel/plugin-solid';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ModelWithUrl } from 'soukai-bis';

import MediaGrid from '@/components/MediaGrid.vue';
import { listVisibilityCacheKey } from '@lists/lib/sharing';
import type { ListVisibility } from '@lists/lib/sharing';
import lists from '@lists/lib/stubs/solid-lists';
import type List from '@lists/models/List';

import ListCard from './ListCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    list: string;
    visibility?: ListVisibility;
};

const VISIBILITIES: ListVisibility[] = ['public', 'unlisted', 'private'];

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

export const WithOwner: Story = {
    render(args) {
        const list = lists.resolve(args.list);
        const owner = SolidFake.fakeProfile();

        return (
            <div style={{ width: '16rem', margin: '0 auto' }}>
                <ListCard list={list} owner={owner} />
            </div>
        );
    },
};

export const WithVisibility: Story = {
    argTypes: {
        visibility: {
            control: 'select',
            options: VISIBILITIES,
        },
    },
    args: {
        visibility: 'public',
    },
    async beforeEach({ args }) {
        const list = lists.resolve(args.list) as ModelWithUrl<List>;

        if (args.visibility) {
            await Cache.set(listVisibilityCacheKey(list), args.visibility);
        }

        return () => Cache.clear();
    },
    render(args) {
        const list = lists.resolve(args.list);

        return (
            <div style={{ width: '16rem', margin: '0 auto' }}>
                <ListCard list={list} showVisibility />
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

export const GridWithVisibility: Story = {
    async beforeEach() {
        for (const [index, list] of lists.all.entries()) {
            await Cache.set(
                listVisibilityCacheKey(list as ModelWithUrl<List>),
                VISIBILITIES[index % VISIBILITIES.length],
            );
        }

        return () => Cache.clear();
    },
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid itemWidth="16rem">
                {lists.all.map((list) => (
                    <ListCard key={list.url} list={list} showVisibility />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

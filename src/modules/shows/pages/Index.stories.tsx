import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import ShowsIndex from './Index.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Shows/Index',
    component: ShowsIndex,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Grid: Story = {
    render: () => <PageStory route={{ name: 'shows.index' }} />,
};

export const Table: Story = {
    render: () => <PageStory route={{ name: 'shows.index', query: { view: 'table' } }} />,
};

export const Filtered: Story = {
    render: () => <PageStory route={{ name: 'shows.index', query: { watchingStatus: 'watching' } }} />,
};

export const NoResults: Story = {
    render: () => <PageStory route={{ name: 'shows.index', query: { q: 'not found' } }} />,
};

export const EmptyCollection: Story = {
    render: () => <PageStory route={{ name: 'shows.index' }} empty />,
};

export default meta;

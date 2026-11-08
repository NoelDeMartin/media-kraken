import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import MoviesIndex from './Index.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Movies/Index',
    component: MoviesIndex,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Grid: Story = {
    render: () => <PageStory route={{ name: 'movies.index' }} />,
};

export const Table: Story = {
    render: () => <PageStory route={{ name: 'movies.index', query: { view: 'table' } }} />,
};

export const Filtered: Story = {
    render: () => (
        <PageStory route={{ name: 'movies.index', query: { watchingStatus: 'watched', genres: 'tmdb:878' } }} />
    ),
};

export const NoResults: Story = {
    render: () => <PageStory route={{ name: 'movies.index', query: { q: 'not found' } }} />,
};

export const EmptyCollection: Story = {
    render: () => <PageStory route={{ name: 'movies.index' }} empty />,
};

export default meta;

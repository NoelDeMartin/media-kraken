import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import StatsIndex from './Index.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Stats',
    component: StatsIndex,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {
    render: () => <PageStory route={{ name: 'stats.index' }} />,
};

export const EmptyCollection: Story = {
    render: () => <PageStory route={{ name: 'stats.index' }} empty />,
};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import ListsIndex from './Index.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/ListsIndex',
    component: ListsIndex,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {
    render: () => <PageStory route={{ name: 'lists.index' }} />,
};

export const Empty: Story = {
    render: () => <PageStory route={{ name: 'lists.index' }} empty />,
};

export default meta;

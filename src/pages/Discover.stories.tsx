import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import Discover from './Discover.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Discover',
    component: Discover,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {
    render: () => <PageStory route={{ name: 'discover' }} empty />,
};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageStory from '@/lib/storybook/PageStory.vue';

import Home from './Home.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Home',
    component: Home,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {
    render: () => <PageStory route={{ name: 'home' }} />,
};

export const Welcome: Story = {
    render: () => <PageStory route={{ name: 'home' }} empty />,
};

export default meta;

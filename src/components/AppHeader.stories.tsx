import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppHeader from './AppHeader.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Organisms/AppHeader',
    component: AppHeader,
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {};

export default meta;

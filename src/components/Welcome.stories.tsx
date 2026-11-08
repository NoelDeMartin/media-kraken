import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Welcome from './Welcome.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Organisms/Welcome',
    component: Welcome,
};

export const Default: Story = {};

export default meta;

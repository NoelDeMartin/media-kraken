import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ShowsEmptyState from './ShowsEmptyState.vue';

type Story = StoryObj<typeof meta>;

const meta = {
    title: 'Molecules/ShowsEmptyState',
    component: ShowsEmptyState,
    args: { emptyCollection: true },
} satisfies Meta<typeof ShowsEmptyState>;

export const EmptyCollection: Story = {};

export const NoResults: Story = { args: { emptyCollection: false } };

export default meta;

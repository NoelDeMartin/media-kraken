import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MoviesEmptyState from './MoviesEmptyState.vue';

type Story = StoryObj<typeof meta>;

const meta = {
    title: 'Molecules/MoviesEmptyState',
    component: MoviesEmptyState,
    args: { emptyCollection: true },
} satisfies Meta<typeof MoviesEmptyState>;

export const EmptyCollection: Story = {};

export const NoResults: Story = { args: { emptyCollection: false } };

export default meta;

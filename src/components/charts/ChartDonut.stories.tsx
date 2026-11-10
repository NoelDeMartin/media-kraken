import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ChartDonut from './ChartDonut.vue';

type Story = StoryObj<typeof meta>;

const meta = {
    title: 'Molecules/ChartDonut',
    component: ChartDonut,
    args: {
        label: 'Movies',
        slices: [
            { label: 'Watched', value: 11, color: 'var(--color-green-500)' },
            { label: 'Dropped', value: 2, color: 'var(--color-gray-500)' },
            { label: 'Pending', value: 5, color: 'var(--color-blue-500)' },
        ],
    },
} satisfies Meta<typeof ChartDonut>;

export const Default: Story = {};

export const SingleSlice: Story = {
    args: { slices: [{ label: 'Watched', value: 3, color: 'var(--color-green-500)' }] },
};

export const Empty: Story = {
    args: { slices: [{ label: 'Watched', value: 0, color: 'var(--color-green-500)' }] },
};

export default meta;

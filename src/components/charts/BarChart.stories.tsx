import type { Meta, StoryObj } from '@storybook/vue3-vite';

import BarChart from './BarChart.vue';

type Story = StoryObj<typeof meta>;

const meta = {
    title: 'Molecules/Charts/BarChart',
    component: BarChart,
    args: {
        entries: [
            { key: 'scifi', label: 'Science Fiction', value: 42 },
            { key: 'horror', label: 'Horror', value: 31 },
            { key: 'animation', label: 'Animation', value: 18 },
            { key: 'crime', label: 'Crime', value: 9 },
            { key: 'documentary', label: 'A genre with a very long name that will be truncated', value: 1 },
        ],
    },
    render: (args) => (
        <div class="max-w-md">
            <BarChart {...args} />
        </div>
    ),
} satisfies Meta<typeof BarChart>;

export const Default: Story = {};

export const SingleEntry: Story = { args: { entries: [{ key: 'drama', label: 'Drama', value: 1 }] } };

export default meta;

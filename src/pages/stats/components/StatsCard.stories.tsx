import type { Meta, StoryObj } from '@storybook/vue3-vite';

import StatsCard from './StatsCard.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/StatsCard',
    component: StatsCard,
    render: () => (
        <div class="w-56">
            <StatsCard title="Movies watched">
                <span class="text-2xl font-semibold text-gray-900 tabular-nums">42</span>
            </StatsCard>
        </div>
    ),
};

export const Default: Story = {};

export default meta;

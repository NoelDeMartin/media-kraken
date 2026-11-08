import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { useSampleStatsSnapshot } from '@/lib/storybook/collection';
import { getStatsSnapshot } from '@/pages/stats/utils/snapshot';

import StatsOverview from './StatsOverview.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Organisms/Stats/StatsOverview',
    component: StatsOverview,
};

export const Default: Story = {
    render: () => ({
        setup() {
            const snapshot = useSampleStatsSnapshot();

            return () =>
                snapshot.value && (
                    <div class="flex max-w-4xl flex-col gap-4">
                        <StatsOverview snapshot={snapshot.value} />
                    </div>
                );
        },
    }),
};

export const Empty: Story = {
    render: () => (
        <div class="flex max-w-4xl flex-col gap-4">
            <StatsOverview snapshot={getStatsSnapshot([], [])} />
        </div>
    ),
};

export default meta;

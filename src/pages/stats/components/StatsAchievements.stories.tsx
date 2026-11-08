import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { useSampleStatsSnapshot } from '@/lib/storybook/collection';
import { getStatsSnapshot } from '@/pages/stats/utils/snapshot';

import StatsAchievements from './StatsAchievements.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Organisms/Stats/StatsAchievements',
    component: StatsAchievements,
};

export const Default: Story = {
    render: () => ({
        setup() {
            const snapshot = useSampleStatsSnapshot();

            return () =>
                snapshot.value && (
                    <div class="flex max-w-4xl flex-col gap-4">
                        <StatsAchievements snapshot={snapshot.value} />
                    </div>
                );
        },
    }),
};

export const Empty: Story = {
    render: () => (
        <div class="flex max-w-4xl flex-col gap-4">
            <StatsAchievements snapshot={getStatsSnapshot([], [])} />
        </div>
    ),
};

export default meta;

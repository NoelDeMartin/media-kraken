import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { useSampleStatsSnapshot } from '@/lib/storybook/collection';
import { getStatsSnapshot } from '@/pages/stats/utils/snapshot';

import StatsRankAndTraits from './StatsRankAndTraits.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Organisms/StatsRankAndTraits',
    component: StatsRankAndTraits,
};

export const Default: Story = {
    render: () => ({
        setup() {
            const snapshot = useSampleStatsSnapshot();

            return () =>
                snapshot.value && (
                    <div class="flex max-w-4xl flex-col gap-4">
                        <StatsRankAndTraits snapshot={snapshot.value} />
                    </div>
                );
        },
    }),
};

export const Empty: Story = {
    render: () => (
        <div class="flex max-w-4xl flex-col gap-4">
            <StatsRankAndTraits snapshot={getStatsSnapshot([], [])} />
        </div>
    ),
};

export const Ranked: Story = {
    render: () => ({
        setup() {
            const snapshot = useSampleStatsSnapshot();

            return () => {
                const value = snapshot.value;
                const watched = value && Array.from({ length: 20 }, () => value.movies.watched).flat();

                return (
                    value &&
                    watched && (
                        <div class="max-w-4xl">
                            <StatsRankAndTraits snapshot={{ ...value, movies: { ...value.movies, watched } }} />
                        </div>
                    )
                );
            };
        },
    }),
};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleShow, useSampleCollection } from '@/lib/storybook/collection';

import ShowSeason from './ShowSeason.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    show: string;
    season: number;
    open: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Organisms/ShowSeason',
    component: ShowSeason,
    args: { show: 'Severance', season: 2, open: true },
    render: (args) => ({
        setup() {
            const collection = useSampleCollection();

            return () => {
                const season =
                    collection.value &&
                    sampleShow(collection.value, args.show).seasons?.find(({ number }) => number === args.season);

                return (
                    season && (
                        <div class="max-w-3xl">
                            <ShowSeason season={season} open={args.open} />
                        </div>
                    )
                );
            };
        },
    }),
};

export const PartiallyWatched: Story = {};

export const Watched: Story = { args: { season: 1 } };

export const Upcoming: Story = { args: { show: 'Pluribus', season: 1 } };

export const Collapsed: Story = { args: { open: false } };

export default meta;

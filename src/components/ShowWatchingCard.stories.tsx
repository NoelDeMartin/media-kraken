import type { Meta, StoryObj } from '@storybook/vue3-vite';

import shows from '@/lib/stubs/solid-shows';

import MediaGrid from './MediaGrid.vue';
import ShowWatchingCard from './ShowWatchingCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    show: string;
};

const meta: Meta<StoryArgs> = {
    title: 'ShowWatchingCard',
    component: ShowWatchingCard,
    argTypes: {
        show: shows.control,
    },
    args: {
        show: shows.first,
    },
};

export const Primary: Story = {
    render(args) {
        const show = shows.resolve(args.show);

        return (
            <div style={{ maxWidth: '90vw', width: '90%', height: '90%', margin: '0 auto' }}>
                <ShowWatchingCard show={show} style={{ width: '14rem' }} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid itemWidth="14rem">
                {shows.all.map((show) => (
                    <ShowWatchingCard key={show.url} show={show} />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

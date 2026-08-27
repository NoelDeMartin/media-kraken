import type { Meta, StoryObj } from '@storybook/vue3-vite';

import shows from '@/lib/stubs/solid-shows';

import MediaGrid from './MediaGrid.vue';
import ShowCard from './ShowCard.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    show: string;
};

const meta: Meta<StoryArgs> = {
    title: 'ShowCard',
    component: ShowCard,
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
                <ShowCard show={show} style={{ aspectRatio: '2/3', maxHeight: '300px' }} />
            </div>
        );
    },
};

export const Grid: Story = {
    render: () => (
        <div style={{ maxWidth: '90vw', width: '90%', margin: '0 auto' }}>
            <MediaGrid>
                {shows.all.map((show) => (
                    <ShowCard key={show.url} show={show} class="aspect-2/3" />
                ))}
            </MediaGrid>
        </div>
    ),
};

export default meta;

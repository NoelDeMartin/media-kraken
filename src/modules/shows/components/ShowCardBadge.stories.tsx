import type { Meta, StoryObj } from '@storybook/vue3-vite';

import shows from '@shows/lib/stubs/solid-shows';

import ShowCardBadge from './ShowCardBadge.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/ShowCardBadge',
    component: ShowCardBadge,
};

export const AllStatuses: Story = {
    render: () => (
        <div class="flex gap-6">
            {shows.all.map((show) => (
                <div key={show.url} class="flex flex-col items-center gap-1 text-xs text-gray-600">
                    <ShowCardBadge show={show} />
                    {show.watchingStatus}
                </div>
            ))}
        </div>
    ),
};

export default meta;

import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { SHOW_WATCHING_STATUSES, type ShowWatchingStatus as Status } from '@shows/models/ShowWatching';

import ShowWatchingStatus from './ShowWatchingStatus.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/ShowWatchingStatus',
    component: ShowWatchingStatus,
};

export const AllStatuses: Story = {
    render: () => (
        <div class="flex flex-col gap-2">
            {(Object.keys(SHOW_WATCHING_STATUSES) as Status[]).map((status) => (
                <ShowWatchingStatus key={status} status={status} />
            ))}
        </div>
    ),
};

export default meta;

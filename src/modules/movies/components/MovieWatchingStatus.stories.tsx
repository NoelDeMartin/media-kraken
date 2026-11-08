import type { Meta, StoryObj } from '@storybook/vue3-vite';

import type Movie from '@movies/models/Movie';
import { MOVIE_WATCHING_STATUSES, type MovieWatchingStatus as Status } from '@movies/models/WatchAction';

import MovieWatchingStatus from './MovieWatchingStatus.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/MovieWatchingStatus',
    component: MovieWatchingStatus,
};

export const AllStatuses: Story = {
    render: () => (
        <div class="flex flex-col gap-2">
            {(Object.keys(MOVIE_WATCHING_STATUSES) as Status[]).map((status) => (
                <MovieWatchingStatus key={status} movie={{ watchingStatus: status } as Movie} />
            ))}
        </div>
    ),
};

export default meta;

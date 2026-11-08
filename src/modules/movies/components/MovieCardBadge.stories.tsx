import type { Meta, StoryObj } from '@storybook/vue3-vite';

import type Movie from '@movies/models/Movie';
import { MOVIE_WATCHING_STATUSES, type MovieWatchingStatus } from '@movies/models/WatchAction';

import MovieCardBadge from './MovieCardBadge.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/MovieCardBadge',
    component: MovieCardBadge,
};

export const AllStatuses: Story = {
    render: () => (
        <div class="flex gap-6">
            {(Object.keys(MOVIE_WATCHING_STATUSES) as MovieWatchingStatus[]).map((status) => (
                <div key={status} class="flex flex-col items-center gap-1 text-xs text-gray-600">
                    <MovieCardBadge
                        movie={
                            {
                                title: 'Movie',
                                watchingStatus: status,
                                updateWatchingStatus: async () => {},
                            } as unknown as Movie
                        }
                    />
                    {status}
                </div>
            ))}
        </div>
    ),
};

export const Rewatched: Story = {
    render: () => (
        <div class="flex">
            <MovieCardBadge
                movie={
                    {
                        title: 'Movie',
                        watchingStatus: 'watched',
                        watchCount: 3,
                        updateWatchingStatus: async () => {},
                    } as unknown as Movie
                }
            />
        </div>
    ),
};

export default meta;

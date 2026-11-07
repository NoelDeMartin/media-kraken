import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@movies/lib/stubs/solid-movies';

import MoviesTable from './MoviesTable.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof MoviesTable> = {
    title: 'modules/movies/MoviesTable',
    component: MoviesTable,
    render: () => (
        <div style={{ width: '100%', maxWidth: '90vw', margin: '0 auto' }}>
            <MoviesTable movies={movies.all} />
        </div>
    ),
};

export const Primary: Story = {};

export default meta;
